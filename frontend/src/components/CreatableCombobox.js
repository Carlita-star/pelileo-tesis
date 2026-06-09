import { useEffect, useMemo, useRef, useState } from 'react';

function CreatableCombobox({
  label,
  options = [],
  value,
  onChange,
  onCreateOption,
  error,
  placeholder = 'Escribe o selecciona...',
  disabled = false,
}) {
  const wrapperRef = useRef(null);
  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (value?.nombre) {
      setInputValue(value.nombre);
      return;
    }
    if (value?.id) {
      const match = options.find((item) => item.id === value.id);
      setInputValue(match?.nombre || '');
      return;
    }
    setInputValue('');
  }, [value, options]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    const query = inputValue.trim().toLowerCase();
    if (!query) {
      return options;
    }
    return options.filter((item) => item.nombre.toLowerCase().includes(query));
  }, [inputValue, options]);

  const exactMatch = useMemo(() => {
    const query = inputValue.trim().toLowerCase();
    if (!query) {
      return null;
    }
    return options.find((item) => item.nombre.toLowerCase() === query) || null;
  }, [inputValue, options]);

  const registerValue = async (nombre) => {
    const trimmed = nombre.trim();
    if (!trimmed) {
      onChange(null);
      return;
    }

    const existing = options.find((item) => item.nombre.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      onChange({ id: existing.id, nombre: existing.nombre });
      setInputValue(existing.nombre);
      setLocalError('');
      return;
    }

    setCreating(true);
    setLocalError('');
    try {
      const created = await onCreateOption(trimmed);
      onChange({ id: created.id, nombre: created.nombre });
      setInputValue(created.nombre);
    } catch (err) {
      setLocalError(err.message || 'No se pudo registrar la opción.');
    } finally {
      setCreating(false);
    }
  };

  const handleSelectOption = async (option) => {
    setOpen(false);
    setInputValue(option.nombre);
    onChange({ id: option.id, nombre: option.nombre });
    setLocalError('');
  };

  const handleBlur = async () => {
    setOpen(false);
    if (creating) {
      return;
    }
    await registerValue(inputValue);
  };

  const handleKeyDown = async (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      setOpen(false);
      await registerValue(inputValue);
    }
    if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  const showCreateOption = inputValue.trim() && !exactMatch;

  return (
    <div className="form-group creatable-combobox" ref={wrapperRef}>
      <label>{label}</label>
      <div className={`combobox-control ${error || localError ? 'input-error' : ''}`}>
        <input
          type="text"
          value={inputValue}
          placeholder={placeholder}
          disabled={disabled || creating}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setInputValue(event.target.value);
            setOpen(true);
            setLocalError('');
            onChange(null);
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
        {creating && <span className="combobox-status">Registrando...</span>}
      </div>

      {open && (filteredOptions.length > 0 || showCreateOption) && (
        <ul className="combobox-options">
          {filteredOptions.map((option) => (
            <li key={option.id}>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelectOption(option)}
              >
                {option.nombre}
              </button>
            </li>
          ))}
          {showCreateOption && (
            <li className="combobox-create">
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => registerValue(inputValue)}
              >
                Registrar &quot;{inputValue.trim()}&quot;
              </button>
            </li>
          )}
        </ul>
      )}

      {!creating && inputValue.trim() && !value?.id && !localError && (
        <span className="combobox-hint">Presiona Enter o sal del campo para registrar.</span>
      )}

      {(error || localError) && <span className="error-text">{error || localError}</span>}
    </div>
  );
}

export default CreatableCombobox;
