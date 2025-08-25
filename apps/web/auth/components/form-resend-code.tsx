import { Button } from "@workspace/ui/components/button";

// ----------------------------------------------------------------------

type FormResendCodeProps = {
  timer?: number;
  disabled?: boolean;
  canResend?: boolean;
  onResendCode?: () => void;
};

export function FormResendCode({
  timer,
  disabled,
  onResendCode,
  canResend,
}: FormResendCodeProps) {
  return (
    <div className="flex flex-col items-center">
      {canResend ? (
        <Button
          type="button"
          variant="ghost"
          className="cursor-pointer mt-5"
          onClick={onResendCode}
          disabled={disabled}
        >
          Resend OTP
        </Button>
      ) : (
        <p className="text-center text-sm mt-5">Resend OTP in {timer}s</p>
      )}
    </div>
  );
}
