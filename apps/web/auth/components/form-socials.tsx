import { Button } from "@workspace/ui/components/button";

import { Iconify } from "@/components/iconify";

// ----------------------------------------------------------------------

type FormSocialsProps = {
  signInWithGoogle?: () => void;
  disabled?: boolean;
};

export function FormSocials({
  signInWithGoogle,
  disabled,
  ...other
}: FormSocialsProps) {
  return (
    <Button
      className="w-full cursor-pointer shadow rounded-lg bg-white flex items-center gap-2 my-6"
      variant="outline"
      disabled={disabled}
    >
      <Iconify width={22} icon="socials:google" />
      Google
    </Button>
  );
}
