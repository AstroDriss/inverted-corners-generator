interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactElement;
  blurValue?: number;
  gap?: string;
}

const Input = ({
  icon,
  blurValue,
  gap = "1.5em",
  className = "",
  ...rest
}: InputProps) => {
  return (
    <div className="relative flex">
      {icon && (
        <div className="absolute left-1 top-1/2 -translate-y-1/2 text-gray-500">
          {icon}
        </div>
      )}
      <input
        {...rest}
        ref={(el) => {
          if (!el || !blurValue) return;

          const controller = new AbortController();
          el.addEventListener(
            "blur",
            () => {
              el.value = String(blurValue);
            },
            {
              signal: controller.signal,
            }
          );
          return () => controller.abort();
        }}
        type="number"
        step="any"
        min="0"
        style={{ ...(icon && { paddingLeft: gap }) }}
        className={`border py-0.5 px-2 rounded-[5px] appearance-none w-full ${className}`}
      />
    </div>
  );
};

export default Input;
