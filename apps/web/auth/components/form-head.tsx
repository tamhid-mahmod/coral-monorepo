// ----------------------------------------------------------------------

type FormHeadProps = {
  title: string;
  description: string;
};

export function FormHead({ title, description }: FormHeadProps) {
  return (
    <>
      <h5 className="text-2xl font-semibold tracking-tight mb-2">{title}</h5>
      <p className="text-sm text-gray-700 mb-4">{description}</p>
    </>
  );
}
