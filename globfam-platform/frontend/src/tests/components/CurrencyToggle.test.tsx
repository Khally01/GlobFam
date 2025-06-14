import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CurrencyToggle } from '@/components/dashboard/CurrencyToggle';

describe('CurrencyToggle', () => {
  const mockOnCurrencyChange = vi.fn();

  beforeEach(() => {
    mockOnCurrencyChange.mockClear();
  });

  it('should render all currency options', () => {
    render(
      <CurrencyToggle
        selectedCurrency="USD"
        onCurrencyChange={mockOnCurrencyChange}
      />
    );

    expect(screen.getByText('USD')).toBeInTheDocument();
    expect(screen.getByText('AUD')).toBeInTheDocument();
    expect(screen.getByText('MNT')).toBeInTheDocument();
  });

  it('should show selected currency as active', () => {
    render(
      <CurrencyToggle
        selectedCurrency="AUD"
        onCurrencyChange={mockOnCurrencyChange}
      />
    );

    const audButton = screen.getByText('AUD').closest('button');
    expect(audButton).toHaveClass('bg-white', 'text-gray-900', 'shadow-sm');
  });

  it('should call onCurrencyChange when clicking a currency', () => {
    render(
      <CurrencyToggle
        selectedCurrency="USD"
        onCurrencyChange={mockOnCurrencyChange}
      />
    );

    const audButton = screen.getByText('AUD');
    fireEvent.click(audButton);

    expect(mockOnCurrencyChange).toHaveBeenCalledWith('AUD');
    expect(mockOnCurrencyChange).toHaveBeenCalledTimes(1);
  });

  it('should display currency flags', () => {
    render(
      <CurrencyToggle
        selectedCurrency="USD"
        onCurrencyChange={mockOnCurrencyChange}
      />
    );

    expect(screen.getByText('🇺🇸')).toBeInTheDocument();
    expect(screen.getByText('🇦🇺')).toBeInTheDocument();
    expect(screen.getByText('🇲🇳')).toBeInTheDocument();
  });
});