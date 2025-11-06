"""Unit tests for arithmetic operations"""

import pytest
from decimal import Decimal
from calculator.operations import add, subtract, multiply, divide
from calculator.exceptions import DivisionByZeroError


class TestAddition:
    """Tests for the add() function"""

    def test_add_positive_numbers(self):
        result = add(Decimal('5'), Decimal('3'))
        assert result == Decimal('8')

    def test_add_negative_numbers(self):
        result = add(Decimal('-5'), Decimal('-3'))
        assert result == Decimal('-8')

    def test_add_mixed_signs(self):
        result = add(Decimal('5'), Decimal('-3'))
        assert result == Decimal('2')

    def test_add_with_zero(self):
        result = add(Decimal('5'), Decimal('0'))
        assert result == Decimal('5')

    def test_add_decimals(self):
        result = add(Decimal('2.5'), Decimal('3.7'))
        assert result == Decimal('6.2')


class TestSubtraction:
    """Tests for the subtract() function"""

    def test_subtract_positive_numbers(self):
        result = subtract(Decimal('10'), Decimal('4'))
        assert result == Decimal('6')

    def test_subtract_negative_numbers(self):
        result = subtract(Decimal('-10'), Decimal('-4'))
        assert result == Decimal('-6')

    def test_subtract_mixed_signs(self):
        result = subtract(Decimal('10'), Decimal('-4'))
        assert result == Decimal('14')

    def test_subtract_with_zero(self):
        result = subtract(Decimal('5'), Decimal('0'))
        assert result == Decimal('5')

    def test_subtract_decimals(self):
        result = subtract(Decimal('10.5'), Decimal('3.2'))
        assert result == Decimal('7.3')


class TestMultiplication:
    """Tests for the multiply() function"""

    def test_multiply_positive_numbers(self):
        result = multiply(Decimal('7'), Decimal('6'))
        assert result == Decimal('42')

    def test_multiply_negative_numbers(self):
        result = multiply(Decimal('-7'), Decimal('-6'))
        assert result == Decimal('42')

    def test_multiply_mixed_signs(self):
        result = multiply(Decimal('7'), Decimal('-6'))
        assert result == Decimal('-42')

    def test_multiply_by_zero(self):
        result = multiply(Decimal('5'), Decimal('0'))
        assert result == Decimal('0')

    def test_multiply_decimals(self):
        result = multiply(Decimal('2.5'), Decimal('4'))
        assert result == Decimal('10')


class TestDivision:
    """Tests for the divide() function"""

    def test_divide_positive_numbers(self):
        result = divide(Decimal('15'), Decimal('3'))
        assert result == Decimal('5')

    def test_divide_negative_numbers(self):
        result = divide(Decimal('-15'), Decimal('-3'))
        assert result == Decimal('5')

    def test_divide_mixed_signs(self):
        result = divide(Decimal('15'), Decimal('-3'))
        assert result == Decimal('-5')

    def test_divide_with_remainder(self):
        result = divide(Decimal('10'), Decimal('4'))
        assert result == Decimal('2.5')

    def test_divide_decimals(self):
        result = divide(Decimal('7.5'), Decimal('2.5'))
        assert result == Decimal('3')

    def test_divide_by_zero_raises_error(self):
        with pytest.raises(DivisionByZeroError) as exc_info:
            divide(Decimal('5'), Decimal('0'))
        assert "Cannot divide by zero" in str(exc_info.value)

    def test_divide_zero_by_number(self):
        result = divide(Decimal('0'), Decimal('5'))
        assert result == Decimal('0')
