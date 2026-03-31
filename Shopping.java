import java.util.*;
import java.io.*;
import java.nio.file.*;

class Product {
    int productId;
    String name;
    double price;
    double rating;

    Product(int productId, String name, double price, double rating) {
        this.productId = productId;
        this.name = name;
        this.price = price;
        this.rating = rating;
    }

    String printProductInfo() {
        return "Product ID: " + productId + " | Product Name: " + name + " | Price: ₹" + price + " | Rating: " + rating;
    }

    String toFileFormat() {
        return productId + "," + name + "," + price + "," + rating;
    }
}

class CartNode {
    Product product;
    CartNode next;
    CartNode(Product product) { this.product = product; }
}

class ProductStack {
    CartNode top;
    void push(Product product) {
        CartNode newNode = new CartNode(product);
        newNode.next = top;
        top = newNode;
    }
    Product pop() {
        if (top == null) return null;
        Product data = top.product;
        top = top.next;
        return data;
    }
}

class OrderQueue {
    CartNode front, rear;
    void enqueue(Product product) {
        CartNode newNode = new CartNode(product);
        if (rear == null) { front = rear = newNode; }
        else { rear.next = newNode; rear = newNode; }
        System.out.println("Order placed for: " + rear.product.name);
    }
    Product dequeue() {
        if (front == null) return null;
        Product data = front.product;
        front = front.next;
        if (front == null) rear = null;
        return data;
    }
    void displayQueue() {
        if (front == null) { System.out.println("No orders"); return; }
        System.out.println("\n--- Orders to be delivered in following order ---");
        CartNode temp = front;
        for (int i = 1; temp != null; temp = temp.next) {
            System.out.println("Position " + i + ": " + temp.product.printProductInfo());
            i++;
        }
    }
}

class ShoppingCart {
    ProductStack undoStack = new ProductStack();
    CartNode head;
    final String CATALOGUE_FILE = "products.txt";

    void printCatalogue() {
        System.out.println("Catalogue");
        try (BufferedReader br = new BufferedReader(new FileReader(CATALOGUE_FILE))) {
            String line; int i = 1;
            while ((line = br.readLine()) != null) {
                String[] p = line.split(",");
                System.out.println("Product No.: " + i + " | Product ID: " + p[0] + " | Product Name: " + p[1] + " | Price: ₹" + p[2] + " | Rating: " + p[3]);
                i++;
            }
        } catch (IOException e) { System.out.println("Error reading catalogue."); }
    }

    void addProductByFileIndex(int index) {
        try (BufferedReader br = new BufferedReader(new FileReader(CATALOGUE_FILE))) {
            String line; int current = 1;
            while ((line = br.readLine()) != null) {
                if (current == index) {
                    String[] p = line.split(",");
                    addProduct(new Product(Integer.parseInt(p[0]), p[1], Double.parseDouble(p[2]), Double.parseDouble(p[3])));
                    return;
                }
                current++;
            }
            System.out.println("Enter number between 1 and 15");
        } catch (IOException e) { System.out.println("Error accessing catalogue."); }
    }

    void addProduct(Product product) {
        CartNode newNode = new CartNode(product);
        if (head == null) head = newNode;
        else {
            CartNode temp = head;
            while (temp.next != null) temp = temp.next;
            temp.next = newNode;
        }
        System.out.println("Product added to Cart");
    }

    void removeProduct(int productId) {
        if (head == null) { System.out.println("Cart Empty"); return; }
        CartNode delNode = null;
        if (head.product.productId == productId) {
            delNode = head; head = head.next;
        } else {
            CartNode curr = head;
            while (curr.next != null && curr.next.product.productId != productId) curr = curr.next;
            if (curr.next != null) { delNode = curr.next; curr.next = delNode.next; }
        }
        if (delNode != null) {
            undoStack.push(delNode.product);
            System.out.println("Item " + delNode.product.name + " removed.");
        } else System.out.println("Product not found.");
    }

    void undo() {
        Product p = undoStack.pop();
        if (p != null) { addProduct(p); System.out.println("Restored: " + p.name); }
        else System.out.println("Nothing to undo.");
    }

    void displayCart() {
        if (head == null) { System.out.println("Cart is empty."); return; }
        CartNode temp = head;
        System.out.println("Product ID | Product Name | Price | Rating");
        while (temp != null) {
            System.out.println(temp.product.printProductInfo());
            temp = temp.next;
        }
    }

    void sortByProductId() {
        if (head == null || head.next == null) return;
        for (CartNode i = head; i != null; i = i.next) {
            for (CartNode j = i.next; j != null; j = j.next) {
                if (i.product.productId > j.product.productId) {
                    Product t = i.product; i.product = j.product; j.product = t;
                }
            }
        }
        System.out.println("Cart sorted by Product ID.");
    }

    void sortByProductName() {
        if (head == null || head.next == null) return;
        for (CartNode i = head; i != null; i = i.next) {
            for (CartNode j = i.next; j != null; j = j.next) {
                if (i.product.name.compareToIgnoreCase(j.product.name) > 0) {
                    Product t = i.product; i.product = j.product; j.product = t;
                }
            }
        }
        System.out.println("Cart sorted by Product Name.");
    }

    int getCount() {
        int count = 0; CartNode temp = head;
        while (temp != null) { count++; temp = temp.next; }
        return count;
    }

    CartNode getNodeAt(int index) {
        CartNode temp = head;
        for (int i = 0; i < index && temp != null; i++) temp = temp.next;
        return temp;
    }

    void binarySearchById(int id) {
        sortByProductId();
        int low = 0, high = getCount() - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            CartNode midNode = getNodeAt(mid);
            if (midNode.product.productId == id) {
                System.out.println("Found: " + midNode.product.printProductInfo());
                return;
            } else if (midNode.product.productId < id) low = mid + 1;
            else high = mid - 1;
        }
        System.out.println("Product ID " + id + " not found.");
    }

    void binarySearchByName(String name) {
        sortByProductName();
        int low = 0, high = getCount() - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            CartNode midNode = getNodeAt(mid);
            int res = midNode.product.name.compareToIgnoreCase(name);
            if (res == 0) {
                System.out.println("Found: " + midNode.product.printProductInfo());
                return;
            } else if (res < 0) low = mid + 1;
            else high = mid - 1;
        }
        System.out.println("Product '" + name + "' not found.");
    }
}

public class Shopping {
    static final String ORDERS_FILE    = "orders.txt";
    static final String DELIVERED_FILE = "delivered.txt";

    public static void saveOrdersToFile(OrderQueue queue) {
        try (PrintWriter writer = new PrintWriter(new FileWriter(ORDERS_FILE, true))) {
            CartNode temp = queue.front;
            while (temp != null) {
                writer.println(temp.product.toFileFormat());
                temp = temp.next;
            }
        } catch (IOException e) {
            System.out.println("Error saving orders.");
        }
    }

    /**
     * Removes the first matching line from orders.txt (by productId),
     * then appends that line to delivered.txt.
     */
    public static void moveToDelivered(Product delivered) {
        File ordersFile = new File(ORDERS_FILE);
        List<String> remaining = new ArrayList<>();
        String deliveredLine = null;

        // Read all lines and pick out the first match to remove
        try (BufferedReader br = new BufferedReader(new FileReader(ordersFile))) {
            String line;
            while ((line = br.readLine()) != null) {
                if (deliveredLine == null) {
                    String[] parts = line.split(",");
                    if (parts.length > 0 && parts[0].trim().equals(String.valueOf(delivered.productId))) {
                        deliveredLine = line; // capture for delivered.txt, skip from remaining
                        continue;
                    }
                }
                remaining.add(line);
            }
        } catch (IOException e) {
            System.out.println("Error reading orders file.");
            return;
        }

        // Rewrite orders.txt without the delivered entry
        try (PrintWriter pw = new PrintWriter(new FileWriter(ordersFile, false))) {
            for (String line : remaining) pw.println(line);
        } catch (IOException e) {
            System.out.println("Error updating orders file.");
            return;
        }

        // Append the delivered entry to delivered.txt
        String lineToWrite = (deliveredLine != null) ? deliveredLine : delivered.toFileFormat();
        try (PrintWriter pw = new PrintWriter(new FileWriter(DELIVERED_FILE, true))) {
            pw.println(lineToWrite);
        } catch (IOException e) {
            System.out.println("Error writing to delivered file.");
        }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        ShoppingCart cart = new ShoppingCart();
        OrderQueue orderQueue = new OrderQueue();
        boolean running = true;

        System.out.println("--- Welcome to the Shop ---");

        while (running) {
            System.out.println("\n1. Show Catalogue\n2. Add Product to Cart\n3. Remove Product from Cart\n4. Display Cart\n5. Sort by Product ID\n6. Sort by Product Name\n7. Search by Product ID\n8. Search by Product Name\n9. Undo Last Removal\n10. Place Order\n11. Orders to be delivered\n12. Mark Product as delivered\n13. Exit");
            System.out.print("\nChoose an option: ");

            int choice;
            try { choice = sc.nextInt(); }
            catch (Exception e) { System.out.println("Please enter a valid integer!"); sc.nextLine(); continue; }

            switch (choice) {
                case 1: cart.printCatalogue(); break;
                case 2: cart.printCatalogue(); System.out.print("Enter product number to add: "); cart.addProductByFileIndex(sc.nextInt()); break;
                case 3:
                    if (cart.getCount() != 0) {
                        cart.displayCart(); System.out.print("Enter Product ID to remove: ");
                        cart.removeProduct(sc.nextInt());
                    } else System.out.println("Cart Empty. No product to remove");
                    break;
                case 4: System.out.println("\n--- Your Current Cart ---"); cart.displayCart(); break;
                case 5:
                    if (cart.getCount() != 0) { cart.sortByProductId(); cart.displayCart(); }
                    else System.out.println("Cart Empty. Nothing to sort");
                    break;
                case 6:
                    if (cart.getCount() != 0) { cart.sortByProductName(); cart.displayCart(); }
                    else System.out.println("Cart Empty. Nothing to sort");
                    break;
                case 7:
                    if (cart.getCount() != 0) { System.out.print("Enter Product ID to search: "); cart.binarySearchById(sc.nextInt()); }
                    else System.out.println("Cart Empty. Nothing to search");
                    break;
                case 8:
                    if (cart.getCount() != 0) { sc.nextLine(); System.out.print("Enter Product Name to search: "); cart.binarySearchByName(sc.nextLine()); }
                    else System.out.println("Cart Empty. Nothing to search");
                    break;
                case 9: cart.undo(); break;
                case 10:
                    if (cart.getCount() == 0) {
                        System.out.println("Cart is empty. Add products before placing an order.");
                    } else {
                        CartNode temp = cart.head;
                        while (temp != null) { orderQueue.enqueue(temp.product); temp = temp.next; }
                        saveOrdersToFile(orderQueue);
                        cart.head = null;
                        System.out.println("All items placed in order queue. Cart has been cleared.");
                    }
                    break;
                case 11: orderQueue.displayQueue(); break;
                case 12:
                    try {
                        Product delivery = orderQueue.dequeue();
                        if (delivery == null) throw new Exception();
                        moveToDelivered(delivery);  // Remove from orders.txt, add to delivered.txt
                        System.out.println("You marked Product: " + delivery.name + " as delivered");
                        System.out.println("The below orders are to be arrived in the following order");
                        orderQueue.displayQueue();
                    } catch (Exception e) { System.out.println("No items to mark"); }
                    break;
                case 13: running = false; System.out.println("Goodbye!"); break;
                default: System.out.println("Invalid choice. Try again.");
            }
        }
    }
}
