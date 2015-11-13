package Tool;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;

public class ObjectIO {
	public static Object readObject(String filename) throws FileNotFoundException, IOException, ClassNotFoundException {
		return readObject(new File(filename));
	}

	public static Object readObject(File file) throws FileNotFoundException, IOException, ClassNotFoundException {
		ObjectInputStream ois = new ObjectInputStream(new FileInputStream(file));
		Object obj = ois.readObject();
		ois.close();
		return obj;
	}

	public static void writeObject(String filename, Object obj) throws FileNotFoundException, IOException {
		writeObject(new File(filename), obj);
	}

	public static void writeObject(File file, Object obj) throws FileNotFoundException, IOException {
		ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(file));
		oos.writeObject(obj);
		oos.close();
	}
}
