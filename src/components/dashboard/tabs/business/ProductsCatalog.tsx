import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Plus, X, Package, ImageIcon, Link as LinkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/types/organizationWebsite';
import { UploadButton } from '@/components/UploadButton';
import { supabase } from '@/integrations/supabase/client';

interface ProductsCatalogProps {
  products: Product[];
  onProductsChange: (products: Product[]) => void;
  websiteId?: string;
}

const MAX_PRODUCTS = 6;

export const ProductsCatalog = ({ products, onProductsChange, websiteId }: ProductsCatalogProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    price: '',
    category: '',
    image_url: '',
    url: '',
  });

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) return;
    
    const product: Product = {
      id: crypto.randomUUID(),
      name: newProduct.name,
      price: newProduct.price,
      category: newProduct.category || undefined,
      image_url: newProduct.image_url || undefined,
      url: newProduct.url || undefined,
    };
    
    onProductsChange([...products, product]);
    setNewProduct({ name: '', price: '', category: '', image_url: '', url: '' });
    setIsDialogOpen(false);
  };

  const handleEditProduct = () => {
    if (!editingProduct) return;
    
    const updated = products.map(p => 
      p.id === editingProduct.id ? editingProduct : p
    );
    onProductsChange(updated);
    setEditingProduct(null);
  };

  const handleRemoveProduct = (id: string) => {
    onProductsChange(products.filter(p => p.id !== id));
  };

  const handleImageUpload = async (file: File, isEditing: boolean) => {
    if (!websiteId) return;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `products/${websiteId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('organization-assets')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading product image:', uploadError);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('organization-assets')
      .getPublicUrl(filePath);

    if (isEditing && editingProduct) {
      setEditingProduct({ ...editingProduct, image_url: publicUrl });
    } else {
      setNewProduct({ ...newProduct, image_url: publicUrl });
    }
  };

  const isAtLimit = products.length >= MAX_PRODUCTS;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Catálogo de Produtos ({products.length}/{MAX_PRODUCTS})</Label>
        {isAtLimit && (
          <Badge variant="secondary">Limite atingido</Badge>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((product) => (
          <Card key={product.id} className="relative group">
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              onClick={() => handleRemoveProduct(product.id)}
            >
              <X className="h-3 w-3" />
            </Button>
            <CardContent className="p-3">
              <div 
                className="aspect-square bg-muted rounded-lg mb-2 flex items-center justify-center overflow-hidden cursor-pointer"
                onClick={() => setEditingProduct(product)}
              >
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <Package className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <p className="font-medium text-sm truncate">{product.name}</p>
              <p className="text-primary font-semibold">{product.price}€</p>
              {product.category && (
                <Badge variant="outline" className="mt-1 text-xs">{product.category}</Badge>
              )}
              {product.url && (
                <div className="flex items-center gap-1 mt-1 text-xs text-primary">
                  <LinkIcon className="h-3 w-3" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Add Product Card */}
        {!isAtLimit && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer hover:border-primary transition-colors">
                <CardContent className="p-3 h-full flex flex-col items-center justify-center min-h-[160px]">
                  <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Adicionar</span>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Produto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome do Produto *</Label>
                  <Input
                    value={newProduct.name || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="Nome do produto"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preço (€) *</Label>
                  <Input
                    value={newProduct.price || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="12.50"
                    type="number"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Input
                    value={newProduct.category || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    placeholder="Ex: Queijos, Vinhos..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Imagem do Produto</Label>
                  <div className="flex items-center gap-3">
                    {newProduct.image_url && (
                      <img src={newProduct.image_url} alt="Preview" className="h-16 w-16 object-cover rounded" />
                    )}
                    <UploadButton
                      onUpload={(file) => handleImageUpload(file, false)}
                      uploadText="Carregar Imagem"
                      accept="image/*"
                      maxSize={5}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Link do Produto</Label>
                  <Input
                    value={newProduct.url || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, url: e.target.value })}
                    placeholder="https://loja.com/produto"
                    type="url"
                  />
                  <p className="text-xs text-muted-foreground">
                    Opcional. Adicione um link para a página do produto.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddProduct} disabled={!newProduct.name || !newProduct.price}>
                  Adicionar Produto
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome do Produto *</Label>
                <Input
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Preço (€) *</Label>
                <Input
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                  type="number"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Input
                  value={editingProduct.category || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Imagem do Produto</Label>
                <div className="flex items-center gap-3">
                  {editingProduct.image_url && (
                    <img src={editingProduct.image_url} alt="Preview" className="h-16 w-16 object-cover rounded" />
                  )}
                  <UploadButton
                    onUpload={(file) => handleImageUpload(file, true)}
                    uploadText="Alterar Imagem"
                    accept="image/*"
                    maxSize={5}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Link do Produto</Label>
                <Input
                  value={editingProduct.url || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, url: e.target.value })}
                  placeholder="https://loja.com/produto"
                  type="url"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingProduct(null)}>
              Cancelar
            </Button>
            <Button onClick={handleEditProduct}>
              Guardar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <p className="text-xs text-muted-foreground">
        {isAtLimit 
          ? '⚠️ Atingiu o limite máximo de 6 produtos.'
          : `Pode adicionar até ${MAX_PRODUCTS - products.length} produto(s) mais.`}
      </p>
    </div>
  );
};
