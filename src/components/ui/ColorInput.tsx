import { useState } from "react";

interface Props {
  value: string;
  label: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
}

const ColorInput = ({ value, setValue, label }: Props) => {
  const [textInput, setTextInput] = useState(value);

  const textChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextInput(e.target.value);
  };

  const validateUserInput = () => {
    let color = textInput.trim();
    if (color.length < 3) return setTextInput(value);

    if (color.length < 6) {
      const [r, g, b] = color.split("");
      color = `${r}${r}${g}${g}${b}${b}`;
    } else if (color.length > 6) {
      color = color.slice(0, 6);
    }

    // replace unsupported values with "F"
    color = color.replace(/[^0-9a-fA-F]/g, "F");

    setTextInput(color);
    setValue("#" + color);
  };

  return (
    <div className="flex gap-2 border p-1 rounded-xl">
      <input
        aria-label={label}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={(e) => setTextInput(e.target.value.replace("#", ""))}
        className="border h-[1.45rem] w-[1.45rem]"
        type="color"
      />

      <input
        type="text"
        value={textInput.replace("#", "")}
        className="w-[6.5ch]"
        onChange={textChange}
        onBlur={validateUserInput}
      />
    </div>
  );
};

export default ColorInput;
