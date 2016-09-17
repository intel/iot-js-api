Web IDL for Board and IO APIs

```javascript

interface Board {
    attribute EventHandler onerror;

    Pin pin(PinName);  // board specific dictionary for mapping pins
    sequence<String> pins();  // get all board pin names

    AIO aio(PinName pin);
    GPIO gpio( (PinName or GPIOOptions) options);
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
    PinName pin;
    PinMode mode = "input";
    boolean activeLow = false;
    String edge = "any";  // "none", "rising", "falling", "any"
    String pull = "none"; // "none", "pullup", "pulldown"
};

[Constructor(GPIOOptions options, optional Board board)]
interface GPIO: Pin {
    void write(boolean value);
    void close();
    attribute EventHandler<boolean> onchange;
};

GPIO implements EventEmitter;

// AIO

dictionary AIOOptions {
  PinName pin;
  unsigned long rate;
};

[Constructor( (PinName or AIOOptions) pin, optional Board board)]
interface AIO: Pin {
    unsigned long channel;  // analog channel
    unsigned long rateLimit;     // rate limit for ondata
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
    // 'value' returns PWMData
    void write(PWMData value);
    void stop();
    void close();
};

dictionary PWMData {
  double period;
  double pulseWidth;
  double dutyCycle;
};

// I2C
enum I2CSpeed { "10kbps", "100kbps", "400kbps", "1000kbps", "3400kbps" };

dictionary I2COptions {
  octet bus;
  I2CSpeed speed;
};

[NoInterfaceObject]
interface I2C {
  readonly attribute octet bus;
  readonly attribute I2CBusSpeed speed;
  readonly attribute boolean busy;

  Promise init(I2COptions options);
  void requestRead(octet device,
                                unsigned long size,
                                optional octet register,
                                optional repetitions = 1);
  Promise write(octet device, (USVString or sequence<octet>) data, optional octet register);
  Promise writeBit(octet device, boolean data);
  void abort();  // abort all current read / write operations
  void close();

  attribute EventHandler<sequence<octet>> ondata;
  attribute EventHandler onerror;
};

I2C implements EventEmitter;

// SPI
typedef (sequence<octet> or ArrayBuffer) SPIData;

enum SPIMode {

  "mode0",  // polarity normal, phase 0, i.e. sampled on leading clock
  "mode1",  // polarity normal, phase 1, i.e. sampled on trailing clock
  "mode2",  // polarity inverse, phase 0, i.e. sampled on leading clock
  "mode3"   // polarity inverse, phase 1, i.e. sampled on trailing clock
};

enum SPIDataOrder { "msb", "lsb" };

dictionary SPIOptions {
  unsigned long bus = 0;
  SPIMode mode = "mode0";
  boolean msb = 1;  // 1: MSB first, 0: LSB first
  unsigned long dataBits = 8; // 1, 2, 4, 8, 16
  double speed = 20;  // in MHz, usually 10..66 MHz
};

[NoInterfaceObject]
interface SPI {
  // has all the properties of SPIOptions as read-only attributes
  Promise init(SPIOptions options);
  Promise<SPIData> transfer(SPIData txData);
  void close();
};

// UART
enum UARTBaud { "baud-9600", "baud-19200", "baud-38400", "baud-57600", "baud-115200" };
enum UARTDataBits { "databits-5", "databits-6", "databits-7", "databits-8" };
enum UARTStopBits { "stopbits-1", "stopbits-2" };
enum UARTParity { "none", "even", "odd" };

dictionary UARTOptions {
  DOMString port;
  UARTBaud baud = "115200";
  UARTDataBits dataBits = "8";
  UARTStopBits stopBits = "1";
  UARTParity parity = "none";
  boolean flowControl = false;
};

typedef (USVString or sequence<octet> or ArrayBuffer) UARTData;

[NoInterfaceObject]
interface UARTConnection: EventTarget {
  // has all the properties of UARTInit as read-only attributes
  Promise init(UARTOptions options);
  void close();
  Promise<void> write(UARTData data);
  attribute EventHandler<octet> onread;
};

```
