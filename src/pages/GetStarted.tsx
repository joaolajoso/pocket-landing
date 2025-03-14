
import { useState } from "react";
import { Check, Package, CreditCard, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  city: z.string().min(2, {
    message: "City must be at least 2 characters.",
  }),
  state: z.string().min(2, {
    message: "State must be at least 2 characters.",
  }),
  zipCode: z.string().min(5, {
    message: "Zip code must be at least 5 characters.",
  }),
  country: z.string().min(2, {
    message: "Country must be at least 2 characters.",
  }),
  newsletter: z.boolean().default(false).optional(),
});

type FormData = z.infer<typeof formSchema>;

const GetStarted = () => {
  const [step, setStep] = useState<'plan' | 'checkout'>('plan');
  const [selectedPlan, setSelectedPlan] = useState<'standard' | 'premium' | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      newsletter: false,
    },
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
    // Here you would typically handle order submission
    alert("Order submitted successfully! We'll contact you soon.");
  };

  const handlePlanSelect = (plan: 'standard' | 'premium') => {
    setSelectedPlan(plan);
  };

  const proceedToCheckout = () => {
    if (selectedPlan) {
      setStep('checkout');
    }
  };

  return (
    <div className="container max-w-6xl px-4 py-24 mx-auto">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-4">
          Get Your <span className="text-gradient">PocketCV</span> Card
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
          Choose your plan and order your PocketCV card to start networking with a single tap.
        </p>
      </div>

      {step === 'plan' ? (
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Standard Plan */}
          <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${selectedPlan === 'standard' ? 'ring-2 ring-primary' : ''}`}>
            <CardHeader>
              <CardTitle className="text-2xl">Standard</CardTitle>
              <CardDescription>Perfect for professionals</CardDescription>
              <div className="mt-2">
                <span className="text-3xl font-bold">$29.99</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-2" />
                  <span>1 NFC-enabled PocketCV Card</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-2" />
                  <span>1 Year Cloud Hosting</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-2" />
                  <span>Basic Profile Customization</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-2" />
                  <span>View Profile Analytics</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => handlePlanSelect('standard')}
                variant={selectedPlan === 'standard' ? 'default' : 'outline'}
              >
                {selectedPlan === 'standard' ? 'Selected' : 'Select Plan'}
              </Button>
            </CardFooter>
          </Card>

          {/* Premium Plan */}
          <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${selectedPlan === 'premium' ? 'ring-2 ring-primary' : ''}`}>
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
              Popular
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">Premium</CardTitle>
              <CardDescription>For serious networkers</CardDescription>
              <div className="mt-2">
                <span className="text-3xl font-bold">$49.99</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-2" />
                  <span>2 NFC-enabled PocketCV Cards</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-2" />
                  <span>Lifetime Cloud Hosting</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-2" />
                  <span>Advanced Profile Customization</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-2" />
                  <span>Detailed Analytics Dashboard</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-2" />
                  <span>Priority Customer Support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full pocketcv-gradient-bg text-white hover:opacity-90" 
                onClick={() => handlePlanSelect('premium')}
                variant={selectedPlan === 'premium' ? 'default' : 'outline'}
              >
                {selectedPlan === 'premium' ? 'Selected' : 'Select Plan'}
              </Button>
            </CardFooter>
          </Card>

          <div className="md:col-span-2 mt-8 text-center">
            <Button 
              size="lg" 
              disabled={!selectedPlan}
              onClick={proceedToCheckout}
              className="pocketcv-gradient-bg text-white hover:opacity-90"
            >
              Continue to Checkout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">1</div>
            <div className="h-0.5 flex-1 bg-primary"></div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">2</div>
          </div>

          <div className="bg-card rounded-lg shadow-sm p-6 mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-medium">Order Summary</h3>
                <p className="text-muted-foreground">
                  {selectedPlan === 'standard' ? 'Standard Plan' : 'Premium Plan'}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">{selectedPlan === 'standard' ? '$29.99' : '$49.99'}</p>
                <Button variant="ghost" size="sm" onClick={() => setStep('plan')}>
                  Change
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Package className="h-12 w-12 text-primary" />
              <div>
                <h4 className="font-medium">
                  {selectedPlan === 'standard' ? '1 PocketCV Card' : '2 PocketCV Cards'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {selectedPlan === 'standard' ? '1 Year Cloud Hosting' : 'Lifetime Cloud Hosting'}
                </p>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="bg-card rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium mb-4">Shipping Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="john.doe@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="San Francisco" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="California" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zip Code</FormLabel>
                        <FormControl>
                          <Input placeholder="94103" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="United States" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="newsletter"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2 flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Subscribe to newsletter</FormLabel>
                          <FormDescription>
                            Get updates on new features and promotions.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="bg-card rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium mb-4">Payment Method</h3>
                <div className="mb-4">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <div className="mt-1 flex items-center">
                    <CreditCard className="h-5 w-5 text-muted-foreground mr-2" />
                    <Input id="cardNumber" placeholder="4242 4242 4242 4242" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input id="expiry" placeholder="MM / YY" />
                  </div>
                  <div>
                    <Label htmlFor="cvc">CVC</Label>
                    <Input id="cvc" placeholder="123" />
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="pocketcv-gradient-bg text-white hover:opacity-90 px-8"
                >
                  Complete Order
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
};

export default GetStarted;
