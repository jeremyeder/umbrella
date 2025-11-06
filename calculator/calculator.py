"""Main calculator engine for processing expressions"""

from decimal import Decimal, DecimalException
from calculator.models import CalculationResult, Operator
from calculator.parser import parse_expression
from calculator.operations import add, subtract, multiply, divide
from calculator.exceptions import (
    CalculatorError,
    InvalidInputError,
    DivisionByZeroError,
    InvalidOperatorError
)


class Calculator:
    """Calculator engine that orchestrates parsing and calculation"""

    def __init__(self):
        """Create a new calculator instance"""
        self._operations = {
            Operator.ADD: add,
            Operator.SUBTRACT: subtract,
            Operator.MULTIPLY: multiply,
            Operator.DIVIDE: divide,
        }

    def calculate(self, expression_str: str) -> CalculationResult:
        """Process a mathematical expression and return the result

        Args:
            expression_str: User input expression (e.g., "5 + 3")

        Returns:
            CalculationResult with either a value or an error message

        Note:
            This method never raises exceptions. All errors are captured
            and returned in the CalculationResult.
        """
        try:
            # Parse the expression
            expression = parse_expression(expression_str)

            # Validate the expression (e.g., division by zero)
            expression.validate()

            # Execute the operation
            operation_func = self._operations[expression.operator]
            result = operation_func(expression.left_operand, expression.right_operand)

            # Return success result
            return CalculationResult(
                expression=expression_str.strip(),
                value=result,
                error=None
            )

        except DivisionByZeroError:
            return CalculationResult(
                expression=expression_str.strip(),
                value=None,
                error="Cannot divide by zero"
            )

        except InvalidInputError as e:
            return CalculationResult(
                expression=expression_str.strip(),
                value=None,
                error=f"Invalid input: {str(e)}" if str(e) else "Invalid input: please enter valid numbers"
            )

        except InvalidOperatorError as e:
            return CalculationResult(
                expression=expression_str.strip(),
                value=None,
                error=str(e)
            )

        except DecimalException:
            return CalculationResult(
                expression=expression_str.strip(),
                value=None,
                error="Number too large or too small to calculate"
            )

        except Exception as e:
            # Catch any unexpected errors
            return CalculationResult(
                expression=expression_str.strip(),
                value=None,
                error="An error occurred while calculating"
            )

    def get_supported_operators(self) -> list[str]:
        """Get list of supported operator symbols

        Returns:
            List of operator symbols: ['+', '-', '*', '/']
        """
        return [op.value for op in Operator]
