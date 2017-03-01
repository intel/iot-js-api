Web IDL for Board and IO APIs

```javascript

interface Board {
    readonly attribute String name;  // board name, e.g. "arduino101"
    attribute EventHandler onerror;

    Promise<AIO>  aio(PinName pin);
    Promise<GPIO> gpio(PinName or GPIOOptions options);
    Promise<PWM>  pwm( (PinName or PWMOptions) options);
    Promise<I2C>  i2c(I2COptions options);
    Promise<SPI>  spi(SPIOptions options);
    Promise<UART> uart(UARTOptions options);
};

Board implements EventEmitter;

typedef (long or unsigned long or double or unrestricted double) Number;
typedef (DOMString or USVString) String;
typedef (Number or String) PinName;  // implementation uses board specific mapping

enum { "input", "output", "analog-in", "analog-out",
       "pwm", "uart-tx", "uart-rx", "i2c-scl", "i2c-sda",
       "spi-sclk", "spi-mosi", "spi-miso", "spi-ss"
} PinMode;

interface Pin {
    readonly attribute PinName pin;  // board number/name of the pin
    readonly attribute PinMode mode;
};

// AIO

dictionary AIOOptions {
  PinName pin;
  unsigned long rate;
  unsigned long precision;
};

[NoInterfaceObject]
interface AIO: Pin {
    readonly attribute unsigned long channel;  // analog channel
    readonly attribute unsigned long precision;  // 10 or 12 bits

    unsigned long read();
    void close();
};

AIO implements EventEmitter;

// GPIO
dictionary GPIOOptions {
    PinName pin;
    sequence<PinName> port; // GPIO Ports (8, 16 or 32 pins)
    PinMode mode = "input";
    boolean activeLow = false;
    String edge = "any";  // "none", "rising", "falling", "any"
    String state = "high-impedance"; // "high-impedance", "pull-up", "pull-down"
};

[NoInterfaceObject]
interface GPIO: Pin {
    unsigned long read();
    void write(long value);
    void close();
    attribute EventHandler<unsigned long> ondata;
};

GPIO implements EventEmitter;

// PWM
dictionary PWMOptions {
  PinName pin;
  boolean reversePolarity = false;
  double period;
  double pulseWidth;
  double dutyCycle;
};

[NoInterfaceObject]
interface PWM: Pin {
    readonly attribute unsigned long channel;
    readonly attribute boolean reversePolarity;
    void write(PWMOptions value);
    void stop();
    void close();
};

// I2C
dictionary I2COptions {
  octet bus;
  unsigned long speed;  // 10, 100, 400, 1000, 3400 kbps
};

[NoInterfaceObject]
interface I2C {
  readonly attribute octet bus;
  readonly attribute unsigned long speed;

  Promise<Buffer> read(octet device, unsigned long size);
  Promise write(octet device, Buffer data);
  void close();
};

// SPI

enum SPIDirection { "full-duplex", "single-write", "single-read", "daisy-chain" };

dictionary SPIOptions {
  unsigned long bus = 0;
  unsigned long polarity = 0;  // 0 or 2
  unsigned long phase = 0;  // 0 or 1
  boolean msbFirst = 1;  // 1: MSB first, 0: LSB first
  unsigned long bits = 8; // 1, 2, 4, 8, 16
  double speed = 20;  // in MHz, usually 10..66 MHz
  SPIDirection direction = "full-duplex";
  unsigned long frameGap = 0;  // in nanoseconds
};

[NoInterfaceObject]
interface SPI {
  // has all the properties of SPIOptions as read-only attributes
  Promise<Buffer> transfer(octet device, Buffer txData);
  void close();
};

// UART
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
  Promise<void> write(Buffer data);
  void setReadRange(long minBytes, long maxBytes);
  attribute EventHandler<Buffer> ondata;
  void close();
};

UART implements EventEmitter;

```
