import type { VocabularyOption } from "@/lib/constants/album";

export default function CheckboxGroup({
  options,
  value,
  onChange,
}: {
  options: VocabularyOption[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  function toggle(code: string) {
    if (value.includes(code)) {
      onChange(value.filter((c) => c !== code));
    } else {
      onChange([...value, code]);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
      {options.map((option) => {
        const checked = value.includes(option.code);
        return (
          <label
            key={option.code}
            className="flex cursor-pointer items-center gap-2 text-[13px] text-[rgba(232,220,192,.85)]"
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(option.code)}
              className="h-4 w-4 rounded border-[rgba(232,220,192,.4)] bg-transparent accent-[#F6D013]"
            />
            {option.label}
          </label>
        );
      })}
    </div>
  );
}
