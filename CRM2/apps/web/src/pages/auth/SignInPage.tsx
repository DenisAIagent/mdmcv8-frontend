import { SignIn } from '@clerk/clerk-react';

export function SignInPage() {
  return (
    <div className="flex justify-center">
      <SignIn 
        redirectUrl="/dashboard"
        appearance={{
          elements: {
            formButtonPrimary: 'bg-mdmc-red hover:bg-red-700',
            card: 'shadow-lg',
          }
        }}
      />
    </div>
  );
}