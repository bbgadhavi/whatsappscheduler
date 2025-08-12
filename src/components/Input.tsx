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
  const commonClasses = "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  const { id, label, ...restProps } = props;

  const Label = () => (
    <label
      htmlFor={id}
      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      {label}
    </label>
  );

  if ('rows' in props && props.rows) {
    return (
      <div className="grid w-full items-center gap-1.5">
        <Label />
        <textarea 
          id={id}
          className={`${commonClasses} min-h-[80px]`}
          {...restProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>} 
        />
      </div>
    );
  }
  
  return (
    <div className="grid w-full items-center gap-1.5">
      <Label />
      <input
        id={id}
        className={`${commonClasses} h-11`}
        {...restProps as React.InputHTMLAttributes<HTMLInputElement>}
      />
    </div>
  );
};

export default Input;
