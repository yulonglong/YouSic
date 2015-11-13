package Distance;

public class Percentage {
	public static double getDistance(double query1, double query2){
		if(Double.isInfinite(query1) || Double.isInfinite(query2)) {
			return 1.0; // Assume same, as it has no meaning.
		}
		return 1 - Math.abs(query1 - query2) / (Math.abs(query1) + Math.abs(query2));
    }
}
