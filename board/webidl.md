Web IDL for Board and IO APIs

```javascript

interface Board {
    readonly attribute String name;  // board name, e.g. "arduino101"
    readonly attribute String os;    // OS name, e.g. "Zephyr-1.0"

    readonly attribute EventHandler onerror;
};

Board implements EventEmitter;

typedef (long or unsigned long or double or unrestricted double) Number;
typedef (DOMString or USVString) String;
typedef (Number or String) PinName;

enum PinMapping { "board", "system" };

// AIO
interface AIOObject {
  AIO open((PinName or AIOOptions) init);
};

dictionary AIOOptions {
  PinName pin;
  PinMapping mapping = "board";
  unsigned long precision = 10;
};

[NoInterfaceObject]
interface AIO {
    readonly attribute PinName pin;
    readonly attribute unsigned long precision;  // 10 or 12 bits

    unsigned long read();
    void close();
};

// GPIO
interface GPIOObject {
  GPIO open((PinName or GPIOOptions) init);
  GPIO port((PinName or sequence<PinName>) port, optional GPIOOptions init);
};

[NoInterfaceObject]
interface GPIO: {
  unsigned long read();
  void write(long value);
  void close();

  attribute EventHandler<unsigned long> ondata;
};

GPIO implements EventEmitter;

dictionary GPIOOptions {
  PinName pin;
  PinMapping mapping = "board";
  GPIOMode mode = "out";
  boolean activeLow = false;
  GPIOEdge edge = "none";
  GPIOState state = "high-impedance";
};

enum GPIOMode { "in", "out" };
enum GPIOEdge { "none", "rising", "falling", "any" };
enum GPIOState { "pull-up", "pull-down", "high-impedance" };

// PWM
interface PWMObject {
  PWM open((PinName or PWMOptions) init);
};

dictionary PWMOptions {
  PinName pin;
  PinMapping mapping = "board";
  boolean reversePolarity = false;
  double period;
  double pulseWidth;
  double dutyCycle;
};

[NoInterfaceObject]
interface PWM {
  readonly attribute PinName pin;
  readonly attribute boolean reversePolarity;

  void write(PWMValue value);
  void stop();
  void close();
};

dictionary PWMValue {
  double period;
  double pulseWidth;
  double dutyCycle;
};

// I2C
interface I2CObject {
  I2C open(I2COptions options);
};

dictionary I2COptions {
  octet bus;
  unsigned long speed;  // 10, 100, 400, 1000, 3400 kbps
};

[NoInterfaceObject]
interface I2C {
  readonly attribute octet bus;
  readonly attribute unsigned long speed;

  Buffer read(octet device, unsigned long size);
  void write(octet device, Buffer data);
  void close();
};

// SPI
interface SPIObject {
  SPI open(SPIOptions options);
};

enum SPITopology { "full-duplex", "single-write", "single-read", "daisy-chain" };

dictionary SPIOptions {
  unsigned long bus = 0;
  unsigned long polarity = 0;  // 0 or 2
  unsigned long phase = 0;  // 0 or 1
  boolean msbFirst = 1;  // 1: MSB first, 0: LSB first
  unsigned long bits = 8; // 1, 2, 4, 8, 16
  double speed = 20;  // in MHz, usually 10..66 MHz
  SPITopology topology = "full-duplex";
  unsigned long frameGap = 0;  // in nanoseconds
};

[NoInterfaceObject]
interface SPI {
  // has all the properties of SPIOptions as read-only attributes
  Buffer transfer(octet device, Buffer txData);
  void close();
};

// UART
interface UARTObject {
  UART open(UARTOptions options);
};

enum UARTParity { "none", "even", "odd" };

dictionary UARTOptions {
  DOMString port;
  long baud = 115200; // 9600, 19200, 38400, 57600, 115200
  long dataBits = 8;  // 5, 6, 7, 8
  long stopBits = 1;  // 1, 2
  UARTParity parity = "none";
  boolean flowControl = false;
};

[NoInterfaceObject]
interface UART {
  // has all the properties of UARTInit as read-only attributes
  void write(Buffer data);
  void setReadRange(long minBytes, long maxBytes);
  attribute EventHandler<Buffer> ondata;
  void close();
};

UART implements EventEmitter;

```
