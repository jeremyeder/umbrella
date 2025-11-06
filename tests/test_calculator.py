"""Unit tests for calculator engine"""

import pytest
from decimal import Decimal
from calculator.calculator import Calculator


class TestSuccessfulCalculations:
    """Tests for successful calculations"""

    def test_calculate_addition(self):
        calc = Calculator()
        result = calc.calculate("5 + 3")
        assert result.is_success
        assert result.value == Decimal('8')
        assert result.error is None

    def test_calculate_subtraction(self):
        calc = Calculator()
        result = calc.calculate("10 - 4")
        assert result.is_success
        assert result.value == Decimal('6')

    def test_calculate_multiplication(self):
        calc = Calculator()
        result = calc.calculate("7 * 6")
        assert result.is_success
        assert result.value == Decimal('42')

    def test_calculate_division(self):
        calc = Calculator()
        result = calc.calculate("15 / 3")
        assert result.is_success
        assert result.value == Decimal('5')

    def test_calculate_with_decimals(self):
        calc = Calculator()
        result = calc.calculate("10.5 * 2")
        assert result.is_success
        assert result.value == Decimal('21')

    def test_calculate_with_negative_numbers(self):
        calc = Calculator()
        result = calc.calculate("-5 + 3")
        assert result.is_success
        assert result.value == Decimal('-2')

    def test_calculate_preserves_expression(self):
        calc = Calculator()
        result = calc.calculate("5 + 3")
        assert result.expression == "5 + 3"


class TestErrorHandling:
    """Tests for error handling"""

    def test_division_by_zero_error(self):
        calc = Calculator()
        result = calc.calculate("5 / 0")
        assert not result.is_success
        assert result.value is None
        assert "Cannot divide by zero" in result.error

    def test_invalid_input_error(self):
        calc = Calculator()
        result = calc.calculate("abc + 5")
        assert not result.is_success
        assert result.value is None
        assert "Invalid input" in result.error

    def test_missing_operand_error(self):
        calc = Calculator()
        result = calc.calculate("5 +")
        assert not result.is_success
        assert result.value is None
        assert "Invalid input" in result.error

    def test_empty_input_error(self):
        calc = Calculator()
        result = calc.calculate("")
        assert not result.is_success
        assert result.value is None
        assert result.error is not None

    def test_error_preserves_expression(self):
        calc = Calculator()
        result = calc.calculate("5 / 0")
        assert result.expression == "5 / 0"


class TestCalculatorState:
    """Tests for calculator state management"""

    def test_calculator_is_stateless(self):
        """Verify calculator doesn't maintain state between calculations"""
        calc = Calculator()
        result1 = calc.calculate("5 + 3")
        result2 = calc.calculate("10 - 4")

        assert result1.value == Decimal('8')
        assert result2.value == Decimal('6')
        # Verify results are independent
        assert result1.expression != result2.expression

    def test_multiple_calculators_independent(self):
        """Verify multiple calculator instances are independent"""
        calc1 = Calculator()
        calc2 = Calculator()

        result1 = calc1.calculate("5 + 3")
        result2 = calc2.calculate("10 - 4")

        assert result1.value == Decimal('8')
        assert result2.value == Decimal('6')

    def test_get_supported_operators(self):
        """Verify supported operators list"""
        calc = Calculator()
        operators = calc.get_supported_operators()
        assert operators == ['+', '-', '*', '/']
