import java.util.*;

class AndGate {

    public static boolean npand(int arr1[], int arr2[], int goal[], double w1, double w2, double threshold) {
        int output[] = check(arr1, arr2, w1, w2, threshold);

        System.out.println("W1 = " + w1 + ", W2 = " + w2 + ", Threshold = " + threshold);
        System.out.print("Goal = ");

        for (int i = 0; i < output.length; i++) {
            System.out.print(output[i] + " ");
        }

        System.out.println();

        if (checkgoal(output, goal)) {
            System.out.println("Goal matches!");
            System.out.println();
            return true;
        }

        threshold += 1;

        if (threshold > 3) {
            threshold = -1;
            w2 += 1;
        }

        if (w2 > 3) {
            w2 = -1;
            w1 += 1;
        }

        if (w1 > 3) {
            return false;
        }

        return npand(arr1, arr2, goal, w1, w2, threshold);
    }

    public static int[] check(int arr1[], int arr2[], double w1, double w2, double threshold) {
        int output[] = new int[arr1.length];

        for (int i = 0; i < arr1.length; i++) {
            double sum = arr1[i] * w1 + arr2[i] * w2;
            output[i] = sum >= threshold ? 1 : 0;
        }

        return output;
    }

    public static boolean checkgoal(int output[], int goal[]) {
        for (int i = 0; i < output.length; i++) {
            if (output[i] != goal[i]) {
                return false;
            }
        }

        return true;
    }

    public static int[] gate(int arr1[], int arr2[]) {
        int goal[] = {0, 0, 0, 1};
        npand(arr1, arr2, goal, -1, -1, -1);
        return check(arr1, arr2, 1, 1, 1);
    }
}

class OrGate {

    public static boolean npand(int arr1[], int arr2[], int goal[], double w1, double w2, double threshold) {
        int output[] = check(arr1, arr2, w1, w2, threshold);

        System.out.println("W1 = " + w1 + ", W2 = " + w2 + ", Threshold = " + threshold);
        System.out.print("Goal = ");

        for (int i = 0; i < output.length; i++) {
            System.out.print(output[i] + " ");
        }

        System.out.println();

        if (checkgoal(output, goal)) {
            System.out.println("Goal matches!");
            System.out.println();
            return true;
        }

        threshold += 1;

        if (threshold > 3) {
            threshold = -1;
            w2 += 1;
        }

        if (w2 > 3) {
            w2 = -1;
            w1 += 1;
        }

        if (w1 > 3) {
            return false;
        }

        return npand(arr1, arr2, goal, w1, w2, threshold);
    }

    public static int[] check(int arr1[], int arr2[], double w1, double w2, double threshold) {
        int output[] = new int[arr1.length];

        for (int i = 0; i < arr1.length; i++) {
            double sum = arr1[i] * w1 + arr2[i] * w2;
            output[i] = sum >= threshold ? 1 : 0;
        }

        return output;
    }

    public static boolean checkgoal(int output[], int goal[]) {
        for (int i = 0; i < output.length; i++) {
            if (output[i] != goal[i]) {
                return false;
            }
        }

        return true;
    }

    public static int[] gate(int arr1[], int arr2[]) {
        int goal[] = {0, 1, 1, 1};
        npand(arr1, arr2, goal, -1, -1, -1);
        return check(arr1, arr2, 1, 1, 1);
    }
}

class NotGate {

    public static int not(int input) {
        return input == 0 ? 1 : 0;
    }

    public static int[] gate(int arr[]) {
        int output[] = new int[arr.length];

        for (int i = 0; i < arr.length; i++) {
            output[i] = not(arr[i]);
        }

        return output;
    }
}

class XorGate {

    public static int[] gate(int arr1[], int arr2[]) {

        int notA[] = NotGate.gate(arr1);
        int notB[] = NotGate.gate(arr2);

        int aBarB[] = AndGate.gate(notA, arr2);
        int abBar[] = AndGate.gate(arr1, notB);

        return OrGate.gate(aBarB, abBar);
    }
}

class HalfAdder {

    public static void calculate(int A, int B) {

        int arr1[] = {A};
        int arr2[] = {B};

        int xorA[] = {A};
        int xorB[] = {B};

        int sum[] = XorGate.gate(xorA, xorB);

        int carryInput1[] = {A};
        int carryInput2[] = {B};

        int carry[] = AndGate.gate(carryInput1, carryInput2);

        System.out.println("A = " + A + ", B = " + B);
        System.out.println("SUM = " + sum[0]);
        System.out.println("CARRY = " + carry[0]);
        System.out.println();
    }
}

class FullAdder {

    public static void calculate(int A, int B, int Cin) {

        int firstXor[] = XorGate.gate(new int[]{A}, new int[]{B});
        int sum[] = XorGate.gate(firstXor, new int[]{Cin});

        int ab[] = AndGate.gate(new int[]{A}, new int[]{B});
        int xorCin[] = AndGate.gate(firstXor, new int[]{Cin});
        int carry[] = OrGate.gate(ab, xorCin);

        System.out.println("A = " + A + ", B = " + B + ", Cin = " + Cin);
        System.out.println("SUM = " + sum[0]);
        System.out.println("CARRY = " + carry[0]);
        System.out.println();
    }
}

public class main {

    public static void main(String args[]) {

        int arr1[] = {0, 0, 1, 1};
        int arr2[] = {0, 1, 0, 1};

        System.out.println("========== AND GATE ==========");
        AndGate.npand(arr1, arr2, new int[]{0, 0, 0, 1}, -1, -1, -1);

        System.out.println("========== OR GATE ==========");
        OrGate.npand(arr1, arr2, new int[]{0, 1, 1, 1}, -1, -1, -1);

        System.out.println("========== NOT GATE ==========");
        int notOutput[] = NotGate.gate(arr2);

        System.out.print("NOT = ");
        for (int x : notOutput) {
            System.out.print(x + " ");
        }
        System.out.println();
        System.out.println();

        System.out.println("========== XOR GATE ==========");
        int xorOutput[] = XorGate.gate(arr1, arr2);

        System.out.print("XOR = ");
        for (int x : xorOutput) {
            System.out.print(x + " ");
        }
        System.out.println();
        System.out.println();

        System.out.println("========== HALF ADDER ==========");

        for (int A = 0; A <= 1; A++) {
            for (int B = 0; B <= 1; B++) {
                HalfAdder.calculate(A, B);
            }
        }

        System.out.println("========== FULL ADDER ==========");

        for (int A = 0; A <= 1; A++) {
            for (int B = 0; B <= 1; B++) {
                for (int Cin = 0; Cin <= 1; Cin++) {
                    FullAdder.calculate(A, B, Cin);
                }
            }
        }
    }
}