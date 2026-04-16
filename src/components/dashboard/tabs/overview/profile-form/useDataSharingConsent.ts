import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";

interface DataSharingState {
  showConsentModal: boolean;
  pendingData: {
    email?: string;
    phone?: string;
  };
}

export const useDataSharingConsent = () => {
  const { profile } = useProfile();
  const [state, setState] = useState<DataSharingState>({
    showConsentModal: false,
    pendingData: {},
  });

  const checkConsentNeeded = (email?: string, phone?: string) => {
    const needsEmailConsent = email && email !== profile?.email && !profile?.share_email_publicly;
    const needsPhoneConsent = phone && phone !== profile?.phone_number && !profile?.share_phone_publicly;

    if (needsEmailConsent || needsPhoneConsent) {
      setState({
        showConsentModal: true,
        pendingData: {
          ...(needsEmailConsent ? { email } : {}),
          ...(needsPhoneConsent ? { phone } : {}),
        },
      });
      return true;
    }
    return false;
  };

  const closeConsentModal = () => {
    setState({ showConsentModal: false, pendingData: {} });
  };

  return {
    showConsentModal: state.showConsentModal,
    pendingData: state.pendingData,
    checkConsentNeeded,
    closeConsentModal,
  };
};
