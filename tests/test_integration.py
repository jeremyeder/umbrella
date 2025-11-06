"""Integration tests for complete user scenarios"""

import pytest
from decimal import Decimal
from calculator.calculator import Calculator


class TestUserStory1:
    """User Story 1: Basic Arithmetic Operations

    Goal: Users can perform basic mathematical calculations
    """

    def test_scenario_1_simple_addition(self):
        """Acceptance Scenario 1: Simple addition calculation"""
        calc = Calculator()

        # Given: User launches calculator
        # When: User enters "5 + 3"
        result = calc.calculate("5 + 3")

        # Then: System displays "= 8"
        assert result.is_success
        assert result.value == Decimal('8')

    def test_scenario_2_subtraction_with_negative_result(self):
        """Acceptance Scenario 2: Subtraction with negative result"""
        calc = Calculator()

        # When: User enters "3 - 10"
        result = calc.calculate("3 - 10")

        # Then: System displays "= -7"
        assert result.is_success
        assert result.value == Decimal('-7')

    def test_scenario_3_multiplication(self):
        """Acceptance Scenario 3: Multiplication"""
        calc = Calculator()

        # When: User enters "7 * 6"
        result = calc.calculate("7 * 6")

        # Then: System displays "= 42"
        assert result.is_success
        assert result.value == Decimal('42')

    def test_scenario_4_division_with_decimal_result(self):
        """Acceptance Scenario 4: Division with decimal result"""
        calc = Calculator()

        # When: User enters "10 / 4"
        result = calc.calculate("10 / 4")

        # Then: System displays "= 2.5"
        assert result.is_success
        assert result.value == Decimal('2.5')

    def test_scenario_5_decimal_inputs(self):
        """Acceptance Scenario 5: Decimal inputs"""
        calc = Calculator()

        # When: User enters "10.5 * 2"
        result = calc.calculate("10.5 * 2")

        # Then: System displays "= 21" (or "21.0")
        assert result.is_success
        assert result.value == Decimal('21')


class TestUserStory2:
    """User Story 2: Error Handling and Validation

    Goal: Users receive clear feedback when they make errors
    """

    def test_scenario_1_division_by_zero(self):
        """Acceptance Scenario 1: Division by zero error"""
        calc = Calculator()

        # Given: User has calculator open
        # When: User enters "5 / 0"
        result = calc.calculate("5 / 0")

        # Then: System displays "Error: Cannot divide by zero"
        # And: Calculator remains operational
        assert not result.is_success
        assert "Cannot divide by zero" in result.error

        # Verify calculator remains operational
        next_result = calc.calculate("5 + 3")
        assert next_result.is_success
        assert next_result.value == Decimal('8')

    def test_scenario_2_invalid_characters(self):
        """Acceptance Scenario 2: Invalid characters in input"""
        calc = Calculator()

        # When: User enters "abc + 5"
        result = calc.calculate("abc + 5")

        # Then: System displays error message
        # And: Calculator remains operational
        assert not result.is_success
        assert "Invalid input" in result.error

        # Verify calculator remains operational
        next_result = calc.calculate("5 + 3")
        assert next_result.is_success

    def test_scenario_3_incomplete_expression(self):
        """Acceptance Scenario 3: Incomplete expression"""
        calc = Calculator()

        # When: User enters "5 +"
        result = calc.calculate("5 +")

        # Then: System displays error about incomplete expression
        # And: Calculator remains operational
        assert not result.is_success
        assert result.error is not None

        # Verify calculator remains operational
        next_result = calc.calculate("5 + 3")
        assert next_result.is_success


class TestUserStory3:
    """User Story 3: Continuous Calculations

    Goal: Users can perform multiple calculations in sequence
    Note: CLI-level tests for REPL behavior are manual
    """

    def test_scenario_1_multiple_sequential_calculations(self):
        """Acceptance Scenario 1: Multiple calculations in sequence"""
        calc = Calculator()

        # Given: User launches calculator
        # When: User enters "5 + 3"
        result1 = calc.calculate("5 + 3")
        # Then: System displays "= 8"
        assert result1.is_success
        assert result1.value == Decimal('8')

        # When: User enters "10 - 4" (without restarting)
        result2 = calc.calculate("10 - 4")
        # Then: System displays "= 6"
        assert result2.is_success
        assert result2.value == Decimal('6')

        # When: User enters "7 * 6"
        result3 = calc.calculate("7 * 6")
        # Then: System displays "= 42"
        assert result3.is_success
        assert result3.value == Decimal('42')

    def test_scenario_2_calculations_after_errors(self):
        """Verify calculator continues after errors"""
        calc = Calculator()

        # Cause an error
        error_result = calc.calculate("5 / 0")
        assert not error_result.is_success

        # Verify calculator still works
        success_result = calc.calculate("5 + 3")
        assert success_result.is_success
        assert success_result.value == Decimal('8')


class TestEdgeCases:
    """Tests for edge cases from spec"""

    def test_very_large_numbers(self):
        """Test with large numbers"""
        calc = Calculator()
        result = calc.calculate("999999 * 999999")
        assert result.is_success
        assert result.value == Decimal('999998000001')

    def test_very_small_decimals(self):
        """Test with very small decimal numbers"""
        calc = Calculator()
        result = calc.calculate("0.0001 + 0.0002")
        assert result.is_success
        assert result.value == Decimal('0.0003')

    def test_zero_operations(self):
        """Test operations with zero"""
        calc = Calculator()

        # Zero addition
        result1 = calc.calculate("0 + 5")
        assert result1.is_success
        assert result1.value == Decimal('5')

        # Zero multiplication
        result2 = calc.calculate("5 * 0")
        assert result2.is_success
        assert result2.value == Decimal('0')

        # Zero division (dividend)
        result3 = calc.calculate("0 / 5")
        assert result3.is_success
        assert result3.value == Decimal('0')

    def test_negative_number_operations(self):
        """Test operations with negative numbers"""
        calc = Calculator()

        result1 = calc.calculate("-5 + -3")
        assert result1.is_success
        assert result1.value == Decimal('-8')

        result2 = calc.calculate("-5 * -3")
        assert result2.is_success
        assert result2.value == Decimal('15')
