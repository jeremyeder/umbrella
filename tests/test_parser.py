"""Unit tests for input parser"""

import pytest
from decimal import Decimal
from calculator.parser import parse_expression
from calculator.models import Expression, Operator
from calculator.exceptions import InvalidInputError, InvalidOperatorError


class TestValidExpressions:
    """Tests for valid expression parsing"""

    def test_parse_addition(self):
        expr = parse_expression("5 + 3")
        assert expr.left_operand == Decimal('5')
        assert expr.operator == Operator.ADD
        assert expr.right_operand == Decimal('3')

    def test_parse_subtraction(self):
        expr = parse_expression("10 - 4")
        assert expr.left_operand == Decimal('10')
        assert expr.operator == Operator.SUBTRACT
        assert expr.right_operand == Decimal('4')

    def test_parse_multiplication(self):
        expr = parse_expression("7 * 6")
        assert expr.left_operand == Decimal('7')
        assert expr.operator == Operator.MULTIPLY
        assert expr.right_operand == Decimal('6')

    def test_parse_division(self):
        expr = parse_expression("15 / 3")
        assert expr.left_operand == Decimal('15')
        assert expr.operator == Operator.DIVIDE
        assert expr.right_operand == Decimal('3')

    def test_parse_with_extra_spaces(self):
        expr = parse_expression("  5   +   3  ")
        assert expr.left_operand == Decimal('5')
        assert expr.operator == Operator.ADD
        assert expr.right_operand == Decimal('3')

    def test_parse_negative_left_operand(self):
        expr = parse_expression("-5 + 3")
        assert expr.left_operand == Decimal('-5')
        assert expr.operator == Operator.ADD
        assert expr.right_operand == Decimal('3')

    def test_parse_negative_right_operand(self):
        expr = parse_expression("5 + -3")
        assert expr.left_operand == Decimal('5')
        assert expr.operator == Operator.ADD
        assert expr.right_operand == Decimal('-3')

    def test_parse_both_negative(self):
        expr = parse_expression("-5 + -3")
        assert expr.left_operand == Decimal('-5')
        assert expr.operator == Operator.ADD
        assert expr.right_operand == Decimal('-3')

    def test_parse_decimal_numbers(self):
        expr = parse_expression("10.5 * 2.5")
        assert expr.left_operand == Decimal('10.5')
        assert expr.operator == Operator.MULTIPLY
        assert expr.right_operand == Decimal('2.5')

    def test_parse_zero(self):
        expr = parse_expression("0 + 0")
        assert expr.left_operand == Decimal('0')
        assert expr.operator == Operator.ADD
        assert expr.right_operand == Decimal('0')


class TestInvalidExpressions:
    """Tests for invalid expression handling"""

    def test_empty_string_raises_error(self):
        with pytest.raises(InvalidInputError):
            parse_expression("")

    def test_whitespace_only_raises_error(self):
        with pytest.raises(InvalidInputError):
            parse_expression("   ")

    def test_missing_right_operand_raises_error(self):
        with pytest.raises(InvalidInputError):
            parse_expression("5 +")

    def test_missing_left_operand_raises_error(self):
        with pytest.raises(InvalidInputError):
            parse_expression("+ 3")

    def test_missing_operator_raises_error(self):
        with pytest.raises(InvalidInputError):
            parse_expression("5 3")

    def test_invalid_characters_raises_error(self):
        with pytest.raises(InvalidInputError):
            parse_expression("abc + 5")

    def test_invalid_characters_right_raises_error(self):
        with pytest.raises(InvalidInputError):
            parse_expression("5 + xyz")

    def test_multiple_operators_raises_error(self):
        with pytest.raises(InvalidInputError):
            parse_expression("5 + + 3")

    def test_unsupported_operator_raises_error(self):
        # Note: Unsupported operators like ^ are caught by regex as invalid input
        with pytest.raises(InvalidInputError):
            parse_expression("5 ^ 3")
