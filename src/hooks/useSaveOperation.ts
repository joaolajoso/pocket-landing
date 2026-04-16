import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SaveOperationState {
  saving: boolean;
  error: string | null;
  lastSaveTime: number | null;
}

interface SaveOperationOptions {
  retryAttempts?: number;
  retryDelay?: number;
  timeoutMs?: number;
  preventConcurrent?: boolean;
}

export const useSaveOperation = (options: SaveOperationOptions = {}) => {
  const {
    retryAttempts = 3,
    retryDelay = 1000,
    timeoutMs = 10000,
    preventConcurrent = true
  } = options;

  const { toast } = useToast();
  const [state, setState] = useState<SaveOperationState>({
    saving: false,
    error: null,
    lastSaveTime: null
  });

  const withTimeout = useCallback(<T>(
    promise: Promise<T>,
    timeoutMs: number
  ): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
      )
    ]);
  }, []);

  const sleep = useCallback((ms: number) => 
    new Promise(resolve => setTimeout(resolve, ms)), []
  );

  const performSave = useCallback(async <T>(
    saveOperation: () => Promise<T>,
    successMessage?: string,
    errorMessage?: string
  ): Promise<T | null> => {
    // Prevent concurrent saves if option is enabled
    if (preventConcurrent && state.saving) {
      console.warn('Save operation already in progress, skipping');
      return null;
    }

    setState(prev => ({ ...prev, saving: true, error: null }));
    
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= retryAttempts; attempt++) {
      try {
        console.log(`Save attempt ${attempt + 1}/${retryAttempts + 1}`);
        
        const result = await withTimeout(saveOperation(), timeoutMs);
        
        setState(prev => ({
          ...prev,
          saving: false,
          error: null,
          lastSaveTime: Date.now()
        }));

        if (successMessage) {
          toast({
            title: "Success",
            description: successMessage
          });
        }

        return result;
      } catch (error: any) {
        lastError = error;
        console.error(`Save attempt ${attempt + 1} failed:`, error);

        // If this isn't the last attempt, wait before retrying
        if (attempt < retryAttempts) {
          await sleep(retryDelay * Math.pow(2, attempt)); // Exponential backoff
        }
      }
    }

    // All attempts failed
    const errorMsg = lastError?.message || 'Unknown error occurred';
    setState(prev => ({
      ...prev,
      saving: false,
      error: errorMsg
    }));

    toast({
      title: "Save Failed",
      description: errorMessage || `Failed to save after ${retryAttempts + 1} attempts: ${errorMsg}`,
      variant: "destructive",
      action: undefined // We'll handle retries through the UI instead
    });

    return null;
  }, [state.saving, preventConcurrent, retryAttempts, retryDelay, timeoutMs, toast, withTimeout, sleep]);

  const resetError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    performSave,
    resetError
  };
};