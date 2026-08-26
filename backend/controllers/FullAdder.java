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

    public static GateResult npand(int arr1[], int arr2[], int goal[], double startW1, double startW2,
            double startThreshold) {

        for (double w1 = startW1; w1 <= 3; w1 += 1) {

            for (double w2 = startW2; w2 <= 3; w2 += 1) {

                for (double threshold = startThreshold; threshold <= 3; threshold += 1) {

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
                    System.out.println();
                }

                startThreshold = -1;
            }

            startW2 = -1;
        }

        System.out.println("NO VALID WEIGHTS FOUND!");
        return null;
    }

    public static int[] check(int arr1[], int arr2[], double w1, double w2, double threshold) {

        int output[] = new int[arr1.length];

        for (int i = 0; i < arr1.length; i++) {

            double sum = arr1[i] * w1 + arr2[i] * w2;

            if (sum >= threshold) {
                output[i] = 1;
            } else {
                output[i] = 0;
            }
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

    public static GateResult npand(int arr1[], int arr2[], int goal[], double startW1, double startW2,
            double startThreshold) {

        for (double w1 = startW1; w1 <= 3; w1 += 1) {

            for (double w2 = startW2; w2 <= 3; w2 += 1) {

                for (double threshold = startThreshold; threshold <= 3; threshold += 1) {

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
                    System.out.println();
                }

                startThreshold = -1;
            }

            startW2 = -1;
        }

        System.out.println("NO VALID WEIGHTS FOUND!");
        return null;
    }

    public static int[] check(int arr1[], int arr2[], double w1, double w2, double threshold) {

        int output[] = new int[arr1.length];

        for (int i = 0; i < arr1.length; i++) {

            double sum = arr1[i] * w1 + arr2[i] * w2;

            if (sum >= threshold) {
                output[i] = 1;
            } else {
                output[i] = 0;
            }
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

    public static GateResult npnot(int input[], int goal[], double startWeight, double startThreshold) {

        for (double weight = startWeight; weight <= 3; weight += 1) {

            for (double threshold = startThreshold; threshold <= 3; threshold += 1) {

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
                System.out.println();
            }

            startThreshold = -1;
        }

        System.out.println("NO VALID WEIGHTS FOUND!");
        return null;
    }

    public static int[] check(int input[], double weight, double threshold) {

        int output[] = new int[input.length];

        for (int i = 0; i < input.length; i++) {

            double sum = input[i] * weight;

            if (sum >= threshold) {
                output[i] = 1;
            } else {
                output[i] = 0;
            }
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

class XorResult {

    int output[];
    GateResult notA;
    GateResult notB;
    GateResult and1;
    GateResult and2;
    GateResult or;

    XorResult(int output[], GateResult notA, GateResult notB, GateResult and1, GateResult and2, GateResult or) {

        this.output = output;
        this.notA = notA;
        this.notB = notB;
        this.and1 = and1;
        this.and2 = and2;
        this.or = or;
    }
}

class XorGate {

    public static XorResult calculate(int A[], int B[], String title) {

        System.out.println();
        System.out.println("========================================");
        System.out.println(title);
        System.out.println("========================================");

        int notAGoal[] = new int[A.length];
        int notBGoal[] = new int[B.length];

        for (int i = 0; i < A.length; i++) {
            notAGoal[i] = A[i] == 0 ? 1 : 0;
            notBGoal[i] = B[i] == 0 ? 1 : 0;
        }

        System.out.println();
        System.out.println("========== NOT GATE : NOT A ==========");

        GateResult notA = NotGate.npnot(
                A,
                notAGoal,
                -1,
                -1);

        System.out.println("========== NOT GATE : NOT B ==========");

        GateResult notB = NotGate.npnot(
                B,
                notBGoal,
                -1,
                -1);

        int and1Goal[] = new int[A.length];
        int and2Goal[] = new int[A.length];

        for (int i = 0; i < A.length; i++) {

            and1Goal[i] = notAGoal[i] & B[i];
            and2Goal[i] = A[i] & notBGoal[i];
        }

        System.out.println("========== AND GATE : A'B ==========");

        GateResult and1 = AndGate.npand(
                notA.output,
                B,
                and1Goal,
                -1,
                -1,
                -1);

        System.out.println("========== AND GATE : AB' ==========");

        GateResult and2 = AndGate.npand(
                A,
                notB.output,
                and2Goal,
                -1,
                -1,
                -1);

        int orGoal[] = new int[A.length];

        for (int i = 0; i < A.length; i++) {
            orGoal[i] = and1Goal[i] | and2Goal[i];
        }

        System.out.println("========== OR GATE : A'B + AB' ==========");

        GateResult or = OrGate.npand(
                and1.output,
                and2.output,
                orGoal,
                -1,
                -1,
                -1);

        return new XorResult(
                or.output,
                notA,
                notB,
                and1,
                and2,
                or);
    }
}

public class FullAdder {

    public static void main(String args[]) {

        int A[] = { 0, 0, 0, 0, 1, 1, 1, 1 };
        int B[] = { 0, 0, 1, 1, 0, 0, 1, 1 };
        int Cin[] = { 0, 1, 0, 1, 0, 1, 0, 1 };

        System.out.println();
        System.out.println("========================================");
        System.out.println("              FULL ADDER");
        System.out.println("========================================");

        System.out.println();
        System.out.println("SUM = A XOR B XOR Cin");
        System.out.println("CARRY = AB + Cin(A XOR B)");
        System.out.println();

        XorResult XOR1 = XorGate.calculate(
                A,
                B,
                "FIRST XOR : A XOR B");

        int X1[] = XOR1.output;

        XorResult XOR2 = XorGate.calculate(
                X1,
                Cin,
                "SECOND XOR : (A XOR B) XOR Cin");

        int SUM[] = XOR2.output;

        System.out.println();
        System.out.println("========================================");
        System.out.println("           CARRY CALCULATION");
        System.out.println("========================================");

        System.out.println();
        System.out.println("========== AND GATE : AB ==========");

        int ABGoal[] = new int[8];

        for (int i = 0; i < 8; i++) {
            ABGoal[i] = A[i] & B[i];
        }

        GateResult AB = AndGate.npand(
                A,
                B,
                ABGoal,
                -1,
                -1,
                -1);

        System.out.println("========== AND GATE : (A XOR B)Cin ==========");

        int X1CinGoal[] = new int[8];

        for (int i = 0; i < 8; i++) {
            X1CinGoal[i] = X1[i] & Cin[i];
        }

        GateResult X1Cin = AndGate.npand(
                X1,
                Cin,
                X1CinGoal,
                -1,
                -1,
                -1);

        System.out.println("========== OR GATE : AB + (A XOR B)Cin ==========");

        int CarryGoal[] = new int[8];

        for (int i = 0; i < 8; i++) {
            CarryGoal[i] = ABGoal[i] | X1CinGoal[i];
        }

        GateResult CARRY = OrGate.npand(
                AB.output,
                X1Cin.output,
                CarryGoal,
                -1,
                -1,
                -1);

        System.out.println();
        System.out.println("========================================");
        System.out.println("        FULL ADDER FINAL OUTPUT");
        System.out.println("========================================");

        System.out.println();
        System.out.println("A B Cin | SUM CARRY");

        for (int i = 0; i < 8; i++) {

            System.out.println(
                    A[i] + " " +
                            B[i] + "  " +
                            Cin[i] +
                            "   |  " +
                            SUM[i] +
                            "    " +
                            CARRY.output[i]);
        }

        System.out.println();
        System.out.println("========================================");
        System.out.println("             EXPECTED OUTPUT");
        System.out.println("========================================");

        System.out.println();
        System.out.println("A B Cin | SUM CARRY");
        System.out.println("-------------------");
        System.out.println("0 0  0  |  0    0");
        System.out.println("0 0  1  |  1    0");
        System.out.println("0 1  0  |  1    0");
        System.out.println("0 1  1  |  0    1");
        System.out.println("1 0  0  |  1    0");
        System.out.println("1 0  1  |  0    1");
        System.out.println("1 1  0  |  0    1");
        System.out.println("1 1  1  |  1    1");

        System.out.println();
        System.out.println("========================================");
        System.out.println("          FULL ADDER CHECK");
        System.out.println("========================================");

        int expectedSum[] = { 0, 1, 1, 0, 1, 0, 0, 1 };
        int expectedCarry[] = { 0, 0, 0, 1, 0, 1, 1, 1 };

        System.out.println("SUM MATCH = " + check(SUM, expectedSum));
        System.out.println("CARRY MATCH = " + check(CARRY.output, expectedCarry));

        System.out.println();
        System.out.println("========================================");
        System.out.println("          FINAL FULL ADDER STATUS");
        System.out.println("========================================");

        if (check(SUM, expectedSum) && check(CARRY.output, expectedCarry)) {
            System.out.println("FULL ADDER OUTPUT MATCH!");
        } else {
            System.out.println("FULL ADDER OUTPUT DOESN'T MATCH!");
        }
    }

    public static boolean check(int actual[], int expected[]) {

        for (int i = 0; i < actual.length; i++) {

            if (actual[i] != expected[i]) {
                return false;
            }
        }

        return true;
    }
}