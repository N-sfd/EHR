import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-field',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FieldComponent),
      multi: true
    }
  ]
})
export class FieldComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() required: boolean = false;
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() error?: string;
  @Input() hint?: string;
  @Input() disabled: boolean = false;
  @Input() id?: string;

  value: any = '';
  onChange = (value: any) => {};
  onTouched = () => {};

  writeValue(value: any): void {
    this.value = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: any) {
    this.value = event.target.value;
    this.onChange(this.value);
    this.onTouched();
  }
}

