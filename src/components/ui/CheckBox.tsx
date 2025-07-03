interface CheckBoxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactElement;
}
const CheckBox = ({ icon, children, className, ...rest }: CheckBoxProps) => (
  <label
    className={`flex text-sm gap-2 justify-between items-center cursor-pointer p-2 rounded-md ${className}`}
  >
    <p className="flex items-center gap-2">
      {icon} {children}
    </p>
    <input type="checkbox" {...rest} role="switch" />
  </label>
);

export default CheckBox;
