Web IDL for Board and IO APIs

```javascript

interface Board {
    attribute EventHandler onerror;

    Pin pin(PinName);  // board-specific dictionary for mapping pins
    sequence<PinName> pins();  // get all board pin names

    AIO aio(PinName pin);
    GPIO gpio(GPIOInit init);
    PWM pwm( (PinName or PWMOptions) options);

    Promise<I2C> i2c(I2COptions options);
    Promise<SPI> spi(SPIOptions options);
    Promise<UART> uart(UARTOptions options);
};

Board implements EventEmitter;

typedef (long or unsigned long or double or unrestricted double) Number;
typedef (DOMString or USVString) String;
typedef (Number or String) PinName;  // implementation uses board specific mapping

enum { "input", "output", "analog", "pwm" } PinMode;

interface Pin {
    readonly attribute PinName pin;  // board number/name of the pin
    readonly attribute PinName address;  // platform number/name of the pin
    readonly attribute PinMode mode;
    readonly attribute Number value;  // provides a synchronous read()
    readonly attribute sequence<PinMode> supportedModes;
};

// GPIO
dictionary GPIOOptions {
    PinName name;
    sequence<PinName> port;
    PinMode mode = "input";
    boolean activeLow = false;
    String edge = "any";  // "none", "rising", "falling", "any"
    String pull = "none"; // "none", "pull-up", "pull-down"
};

typedef (PinName or sequence<PinName> or GPIOOptions) GPIOInit;

[NoInterfaceObject]
interface GPIO: Pin {
    void write(long value);
    void close();
    attribute EventHandler<long> onchange;
};

GPIO implements EventEmitter;

// GPIO Ports (8, 16 or 32 pins configured together)
[Constructor(GPIOInit init, optional Board board)]
interface GPIOPort: GPIO {
   sequence<PinName> pins();
};

// AIO

dictionary AIOOptions {
  PinName pin;
  unsigned long rate;
};

[Constructor( (PinName or AIOOptions) pin, optional Board board)]
interface AIO: Pin {
    readonly attribute unsigned long channel;  // analog channel
    readonly attribute unsigned long rateLimit;     // rate limit for ondata
    readonly attribute unsigned long precision;  // 10 or 12 bits

    Promise<unsigned long> read();  // one-shot async read
    void close();

    attribute EventHandler<unsigned long> ondata;
};

AIO implements EventEmitter;

// PWM
dictionary PWMOptions {
  PinName pin;
  boolean reversePolarity = false;
};

[Constructor(PWMOptions options, optional Board board)]
interface PWM: Pin {
    readonly attribute unsigned long channel;
    readonly attribute boolean reversePolarity;
    // 'value' returns PWMOptions
    void write(PWMOptions value);
    void stop();
    void close();
};

dictionary PWMOptions {
  double period;
  double pulseWidth;
  double dutyCycle;
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
enum SPIMode {

  "mode0",  // polarity normal, phase 0, i.e. sampled on leading clock
  "mode1",  // polarity normal, phase 1, i.e. sampled on trailing clock
  "mode2",  // polarity inverse, phase 0, i.e. sampled on leading clock
  "mode3"   // polarity inverse, phase 1, i.e. sampled on trailing clock
};

dictionary SPIOptions {
  unsigned long bus = 0;
  SPIMode mode = "mode0";
  boolean msb = 1;  // 1: MSB first, 0: LSB first
  unsigned long bits = 8; // 1, 2, 4, 8, 16
  double speed = 20;  // in MHz, usually 10..66 MHz
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
  attribute EventHandler<Buffer> onread;
  void close();
};

UART implements EventEmitter;

```
