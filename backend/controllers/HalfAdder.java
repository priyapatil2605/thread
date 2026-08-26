class GateResult {
    int output[];
    double w1;
    double w2;
    double threshold;

    GateResult(int output[], double w1, double w2, double threshold) {
        this.output = output;
        this.w1 = w1;
        this.w2 = w2;
        this.threshold = threshold;
    }
}

class AndGate {

    public static GateResult npand(int arr1[], int arr2[], int goal[], double w1, double w2, double threshold) {
        int output[] = check(arr1, arr2, w1, w2, threshold);

        System.out.println("W1 = " + w1 + ", W2 = " + w2 + ", Threshold = " + threshold);
        System.out.print("Goal = ");

        for (int i = 0; i < output.length; i++) {
            System.out.print(output[i] + " ");
        }

        System.out.println();

        if (checkgoal(output, goal)) {
            System.out.println("MATCH!");
            System.out.println();
            return new GateResult(output, w1, w2, threshold);
        }

        System.out.println("Doesn't match!");

        threshold += 1;

        if (threshold > 3) {
            threshold = -1;
            w2 += 1;
        }

        if (w2 > 3) {
            w2 = -1;
            w1 += 1;
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
}

class OrGate {

    public static GateResult npand(int arr1[], int arr2[], int goal[], double w1, double w2, double threshold) {
        int output[] = check(arr1, arr2, w1, w2, threshold);

        System.out.println("W1 = " + w1 + ", W2 = " + w2 + ", Threshold = " + threshold);
        System.out.print("Goal = ");

        for (int i = 0; i < output.length; i++) {
            System.out.print(output[i] + " ");
        }

        System.out.println();

        if (checkgoal(output, goal)) {
            System.out.println("MATCH!");
            System.out.println();
            return new GateResult(output, w1, w2, threshold);
        }

        System.out.println("Doesn't match!");

        threshold += 1;

        if (threshold > 3) {
            threshold = -1;
            w2 += 1;
        }

        if (w2 > 3) {
            w2 = -1;
            w1 += 1;
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
}

class NotGate {

    public static GateResult npnot(int input[], int goal[], double weight, double threshold) {
        int output[] = check(input, weight, threshold);

        System.out.println("W = " + weight + ", Threshold = " + threshold);
        System.out.print("Goal = ");

        for (int i = 0; i < output.length; i++) {
            System.out.print(output[i] + " ");
        }

        System.out.println();

        if (checkgoal(output, goal)) {
            System.out.println("MATCH!");
            System.out.println();
            return new GateResult(output, weight, 0, threshold);
        }

        System.out.println("Doesn't match!");

        threshold += 1;

        if (threshold > 3) {
            threshold = -1;
            weight += 1;
        }

        return npnot(input, goal, weight, threshold);
    }

    public static int[] check(int input[], double weight, double threshold) {
        int output[] = new int[input.length];

        for (int i = 0; i < input.length; i++) {
            double sum = input[i] * weight;

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
}

public class HalfAdder {

    public static void main(String args[]) {

        int A[] = { 0, 0, 1, 1 };
        int B[] = { 0, 1, 0, 1 };

        System.out.println("========================================");
        System.out.println("              HALF ADDER");
        System.out.println("========================================");

        System.out.println();
        System.out.println("Formula:");
        System.out.println("SUM = A'B + AB'");
        System.out.println("CARRY = AB");
        System.out.println();

        System.out.println("========== K1 : NOT A ==========");

        GateResult K1 = NotGate.npnot(
                A,
                new int[] { 1, 1, 0, 0 },
                -1,
                -1);

        System.out.println("========== K2 : NOT B ==========");

        GateResult K2 = NotGate.npnot(
                B,
                new int[] { 1, 0, 1, 0 },
                -1,
                -1);

        System.out.println("========== K3 : A'B AND GATE ==========");

        GateResult K3 = AndGate.npand(
                K1.output,
                B,
                new int[] { 0, 1, 0, 0 },
                -1,
                -1,
                -1);

        System.out.println("========== K4 : AB' AND GATE ==========");

        GateResult K4 = AndGate.npand(
                A,
                K2.output,
                new int[] { 0, 0, 1, 0 },
                -1,
                -1,
                -1);

        System.out.println("========== K5 : A'B + AB' OR GATE ==========");

        GateResult K5 = OrGate.npand(
                K3.output,
                K4.output,
                new int[] { 0, 1, 1, 0 },
                -1,
                -1,
                -1);

        System.out.println("========== K6 : AB AND GATE ==========");

        GateResult K6 = AndGate.npand(
                A,
                B,
                new int[] { 0, 0, 0, 1 },
                -1,
                -1,
                -1);

        System.out.println();
        System.out.println("========================================");
        System.out.println("        HALF ADDER FINAL OUTPUT");
        System.out.println("========================================");

        System.out.println("A B | SUM CARRY");

        for (int i = 0; i < 4; i++) {
            System.out.println(
                    A[i] + " " +
                            B[i] + " | " +
                            K5.output[i] + "   " +
                            K6.output[i]);
        }

        System.out.println();
        System.out.println("========================================");
        System.out.println("       HALF ADDER K VALUES");
        System.out.println("========================================");

        System.out.println("K1 = NOT A");
        System.out.println("K2 = NOT B");
        System.out.println("K3 = A'B");
        System.out.println("K4 = AB'");
        System.out.println("K5 = A'B + AB' = SUM");
        System.out.println("K6 = AB = CARRY");

        System.out.println();
        System.out.println("========================================");
        System.out.println("       HALF ADDER PARAMETERS");
        System.out.println("========================================");

        System.out.println("K1 : W1 = " + K1.w1 + ", W2 = " + K1.w2 + ", Threshold = " + K1.threshold);
        System.out.println("K2 : W1 = " + K2.w1 + ", W2 = " + K2.w2 + ", Threshold = " + K2.threshold);
        System.out.println("K3 : W1 = " + K3.w1 + ", W2 = " + K3.w2 + ", Threshold = " + K3.threshold);
        System.out.println("K4 : W1 = " + K4.w1 + ", W2 = " + K4.w2 + ", Threshold = " + K4.threshold);
        System.out.println("K5 : W1 = " + K5.w1 + ", W2 = " + K5.w2 + ", Threshold = " + K5.threshold);
        System.out.println("K6 : W1 = " + K6.w1 + ", W2 = " + K6.w2 + ", Threshold = " + K6.threshold);

        System.out.println();
        System.out.println("========================================");
        System.out.println("              FINAL W VALUES");
        System.out.println("========================================");

        System.out.println("W1 = " + K1.w1);
        System.out.println("W2 = " + K2.w1);
        System.out.println("W3 = " + K3.w1);
        System.out.println("W4 = " + K4.w1);
        System.out.println("W5 = " + K5.w1);
        System.out.println("W6 = " + K6.w1);

        System.out.println();
        System.out.println("========================================");
        System.out.println("           FINAL THRESHOLDS");
        System.out.println("========================================");

        System.out.println("T1 = " + K1.threshold);
        System.out.println("T2 = " + K2.threshold);
        System.out.println("T3 = " + K3.threshold);
        System.out.println("T4 = " + K4.threshold);
        System.out.println("T5 = " + K5.threshold);
        System.out.println("T6 = " + K6.threshold);
    }
}