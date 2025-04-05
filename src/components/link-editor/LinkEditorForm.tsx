
import { LinkType } from "@/components/LinkCard";
import { getLinkTypeById } from "./LinkTypes";
import { useFormState } from "./form/useFormState";
import { useFormValidation } from "./form/useFormValidation";
import SectionSelect from "./form/SectionSelect";
import LinkTypeSelect from "./form/LinkTypeSelect";
import TitleInput from "./form/TitleInput";
import UrlInput from "./form/UrlInput";
import FormFooter from "./form/FormFooter";

interface LinkEditorFormProps {
  onSave: (link: Omit<LinkType, "id"> & {id?: string, section?: string}) => void;
  onCancel: () => void;
  editingLink?: LinkType & {section?: string};
  sections?: {id: string, title: string}[];
}

export const LinkEditorForm = ({ onSave, onCancel, editingLink, sections = [] }: LinkEditorFormProps) => {
  const { formData, handleChange, handleSelectChange, handleSectionChange } = useFormState(editingLink, sections);
  const { errors, clearError, validateForm } = useFormValidation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(formData.title, formData.url, formData.type)) return;
    
    // Format email as mailto if needed
    let url = formData.url;
    if (formData.type === "email" && !url.startsWith("mailto:")) {
      url = `mailto:${url}`;
    }
    
    const selectedType = getLinkTypeById(formData.type);
    
    onSave({
      id: editingLink?.id,
      title: formData.title,
      url: url,
      icon: selectedType.icon,
      section: formData.section
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      {sections.length > 0 && (
        <SectionSelect 
          sectionId={formData.section} 
          sections={sections} 
          onChange={handleSectionChange} 
        />
      )}
      
      <LinkTypeSelect 
        typeId={formData.type} 
        onChange={handleSelectChange} 
      />
      
      <TitleInput 
        title={formData.title} 
        error={errors.title} 
        onChange={(e) => {
          handleChange(e);
          clearError('title');
        }} 
      />
      
      <UrlInput 
        url={formData.url} 
        error={errors.url} 
        type={formData.type}
        onChange={(e) => {
          handleChange(e);
          clearError('url');
        }} 
      />
      
      <FormFooter onCancel={onCancel} />
    </form>
  );
};
