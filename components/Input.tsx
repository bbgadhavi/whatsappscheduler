import React from 'react';

type BaseInputProps = {
  id: string;
  label: string;
};

type StandardInputProps = BaseInputProps &
  React.InputHTMLAttributes<HTMLInputElement> & {
  rows?: never; 
};

type TextAreaProps = BaseInputProps &
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  rows: number;
};

type InputProps = StandardInputProps | TextAreaProps;

const Input: React.FC<InputProps> = (props) => {
  const commonClasses = "block w-full px-3 pt-5 pb-2 mt-1 bg-black/5 dark:bg-white/5 rounded-t-md appearance-none focus:outline-none focus:ring-0 peer transition-colors duration-300";
  const { id, label } = props;

  const Label = () => (
    <label
      htmlFor={id}
      className="absolute text-sm text-text-secondary dark:text-text-secondary-dark duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] start-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
    >
      {label}
    </label>
  );

  if ('rows' in props && props.rows) {
    const { ...rest } = props;
    return (
      <div className="relative">
        <textarea 
          id={id} 
          className={`${commonClasses} border-b-2 border-gray-300 dark:border-gray-600 focus:border-primary`}
          placeholder=" " 
          {...rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>} 
        />
        <Label />
      </div>
    );
  }

  const { rows, ...rest } = props;
  return (
    <div className="relative">
      <input
        id={id}
        className={`${commonClasses} border-b-2 border-gray-300 dark:border-gray-600 focus:border-primary`}
        placeholder=" "
        {...rest as React.InputHTMLAttributes<HTMLInputElement>}
      />
      <Label />
    </div>
  );
};

export default Input;
