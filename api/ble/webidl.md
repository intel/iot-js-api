Web IDL for Bluetooth Smart, Peripheral Mode
============================================

```javascript
// require returns a BluetoothPeripheralDevice object
// var ble = require("ble-peripheral");

[NoInterfaceObject]
interface BluetoothPeripheralDevice {
    readonly attribute BluetoothDeviceAddress address;
    readonly attribute BluetoothDeviceAddressType addressType;
    readonly attribute String name;

    readonly attribute sequence<Service> services;  // primary services
    boolean addService(Service service);
    boolean removeService(BluetoothUUID uuid, optional boolean recursive = false);

    void enable();
    void disable();

    Promise<AdvertisingOptions> startAdvertising(Advertisement advertisement,
                                           optional AdvertisingOptions options);
    Promise stopAdvertising();

    readonly attribute boolean enabled;
    attribute EventHandler onenabledchange;

    attribute EventHandler<BluetoothDeviceAddress> onconnect;
    attribute EventHandler<BluetoothDeviceAddress> ondisconnect;
    attribute EventHandler<Error> onerror;
};

BluetoothPeripheralDevice implements EventEmitter;

typedef (String or unsigned long long) BluetoothDeviceAddress;
typedef String BluetoothUUID;

enum BluetoothDeviceAddressType {
    "public", "static-random", "private-resolvable", "private"
};
// private addresses are also random, but 'random-private-resolvable' is too long

dictionary AdvertisingOptions {
    boolean connectable = true;
    unsigned long minInterval;  // 100..32000 ms; hint, platform may override
    unsigned long maxInterval;  // 100..32000 ms; hint, platform may override
};

// - one raw Buffer for ad, and a scan response
// - one ad built from 'uuids', .. txPower, if space allows

dictionary AdvertisementData {
    // if specified, used for scan response
    ScanResponse scanResponse;

    // raw advertisment data
    Buffer data;  // if specified, use this and ignore the others

    // or build advertisment data from the following properties, if defined
    sequence<BluetoothUUID> uuids uuids;
    ServiceDataAdvertisement serviceData;
    ManufacturerAdvertisement manufacturerData;
    unsigned long deviceClass;
    boolean includeTxPower = false;
};

// advertisment can be a single raw Buffer or a structure
typedef (AdvertisementData or Buffer) Advertisement;

dictionary ScanResponse {
    String name;  // may get overridden by the platform
    Buffer data;  // may not be used by the platform
};

dictionary ManufacturerData {
    unsigned long manufacturerId;
    Buffer data;
}

disctionary ServiceData {
    BluetoothUUID uuid;
    Buffer data;
}

dictionary Service {
    BluetoothUUID uuid;
    boolean primary;
    Characteristic[] characteristics;
    BluetoothUUID[] includedServices;
};

dictionary Descriptor {
    BluetoothUUID uuid;
    String value;
    GATTFlag[] flags;  // only "read" and "write"
};

dictionary CharacteristicInit {
    BluetoothUUID uuid;
    sequence<GATTFlag> flags;
    sequence <Descriptor> descriptors;
};

[Constructor(CharacteristicInit init)]
interface Characteristic {
    readonly attribute BluetoothUUID uuid;
    readonly attribute sequence<GATTFlag> flags;
    readonly attribute sequence <Descriptor> descriptors;

    void startNotifications();  // notify + indicate
    void stopNotifications();
    readonly attribute boolean notifying;

    void onread(RequestHandler handler);
    void onwrite(RequestHandler handler);
    void onsubscribe(RequestHandler handler);
    void onunsubscribe(RequestHandler handler);

    void onerror(ErrorHandler handler);  // e.g. on indication fail
};

enum GATTFlag { "read", "write", "notify" };  // Bluetooth GATT "properties"

callback RequestHandler = void (Request request);
callback ErrorHandler = void (Error error);

interface Request {
    readonly attribute RequestType type;
    readonly attribute BluetoothDeviceAddress source;
    readonly attribute unsigned long offset = 0;
    readonly attribute Buffer? data = null;
    readonly attribute boolean needsResponse;

    Promise respond(optional Buffer data);
    Promise respondWithError(Error error);
};

enum RequestType { "read", "write", "notify", "subscribe", "unsubscribe"};

```
