
class Result implements Comparable<Result> {
	private double mfcc;
	private int songStartPosition;
	private int sampleStartPosition;
	private int length;
	private String song;

	public Result(double mfcc, int songStartPosition, int sampleStartPosition, int length, String song) {
		this.mfcc = mfcc;
		this.songStartPosition = songStartPosition;
		this.sampleStartPosition = sampleStartPosition;
		this.length = length;
		this.setSong(song);
	}

	@Override
	public int compareTo(Result that) {
		if(this.mfcc == that.mfcc)
			return Integer.compare(that.length, this.length);
		return Double.compare(that.mfcc, this.mfcc);
	}

	@Override
	public String toString() {
		return "Result [mfcc=" + mfcc + ", songStartPosition=" + songStartPosition + ", sampleStartPosition="
				+ sampleStartPosition + ", length=" + length + ", song=" + song + "]";
	}

	public double getMfcc() {
		return mfcc;
	}

	public void setMfcc(double mfcc) {
		this.mfcc = mfcc;
	}

	public int getSongStartPosition() {
		return songStartPosition;
	}

	public void setSongStartPosition(int songStartPosition) {
		this.songStartPosition = songStartPosition;
	}

	public int getSampleStartPosition() {
		return sampleStartPosition;
	}

	public void setSampleStartPosition(int sampleStartPosition) {
		this.sampleStartPosition = sampleStartPosition;
	}

	public int getLength() {
		return length;
	}

	public void setLength(int length) {
		this.length = length;
	}

	public String getSong() {
		return song;
	}

	public void setSong(String song) {
		this.song = song;
	}
}