import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import emailjs from 'emailjs-com';
import { useState } from "react";

// Add EmailJS configuration constants
const EMAILJS_SERVICE_ID = "default_service"; // You will need to replace this with your service ID
const EMAILJS_TEMPLATE_ID = "template_pocketcv"; // You will need to replace this with your template ID
const EMAILJS_USER_ID = "YOUR_USER_ID"; // You will need to replace this with your user ID
const RECIPIENT_EMAIL = "victordejulio13@gmail.com";
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters."
  }),
  email: z.string().email({
    message: "Please enter a valid email address."
  }),
  phone: z.string().min(5, {
    message: "Please enter a valid phone number."
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters."
  }),
  quantity: z.string().min(1, {
    message: "Please specify quantity."
  }),
  agreeToTerms: z.boolean().refine(value => value === true, {
    message: "You must agree to the terms and conditions."
  })
});
type FormValues = z.infer<typeof formSchema>;
const OrderForm = () => {
  const {
    toast
  } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
      quantity: "1",
      agreeToTerms: false
    }
  });
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // Prepare the template parameters
      const templateParams = {
        from_name: data.name,
        from_email: data.email,
        to_name: "PocketCV Team",
        to_email: RECIPIENT_EMAIL,
        phone_number: data.phone,
        message: data.message,
        quantity: data.quantity,
        reply_to: data.email
      };

      // Send the email using EmailJS
      const response = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_USER_ID);
      console.log("Email sent successfully:", response);
      toast({
        title: "Order Submitted!",
        description: "We'll get back to you as soon as possible.",
        duration: 5000
      });
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Submission Failed",
        description: "Please try again later or contact us directly.",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="name" render={({
          field
        }) => <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>} />
          
          <FormField control={form.control} name="email" render={({
          field
        }) => <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="your.email@example.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>} />
          
          <FormField control={form.control} name="phone" render={({
          field
        }) => <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+1 (123) 456-7890" type="tel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>} />
          
          <FormField control={form.control} name="quantity" render={({
          field
        }) => <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input placeholder="How many units?" type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>} />
          
          <FormField control={form.control} name="message" render={({
          field
        }) => <FormItem>
                <FormLabel>Additional Details</FormLabel>
                <FormControl>
                  <Textarea placeholder="Any special requirements or questions about your order?" className="resize-none" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>} />
          
          <FormField control={form.control} name="agreeToTerms" render={({
          field
        }) => <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    I agree to the terms and conditions
                  </FormLabel>
                  <FormDescription>
                    By submitting this form, you agree to our privacy policy.
                  </FormDescription>
                </div>
                <FormMessage />
              </FormItem>} />
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Order"}
          </Button>
        </form>
      </Form>
    </div>;
};
export default OrderForm;