IoT Bluetooth Smart Peripheral API
==================================

- [The `BluetoothPeripheralDevice` interface](#bpd)
- [The `BluetoothService` dictionary](#service)
- [The `BluetoothDescriptor` dictionary](#descriptor)
- [The `BluetoothCharacteristic` interface](#characteristic)
- [The `BluetoothCharacteristicRequest` interface](#characteristicrequest)

Introduction
------------
This API exposes Bluetooth Smart functionality for Bluetooth Smart Peripheral (BSP) mode. The terminology and context is taken from the [Bluetooth 4.2. specification](https://www.bluetooth.org/DocMan/handlers/DownloadDoc.ashx?doc_id=286439).

A Bluetooth Smart Peripheral (BSP) device supports the following functionality:
- Host a [GATT (Generic Attribute Profile)](https://www.bluetooth.com/specifications/gatt) server that exposes a hierarchy of [`Service`](#service), [`Characteristic`](#characteristic) and [`Descriptor`](#descriptor) objects.
- Broadcast (advertise) information (e.g. services) using advertisement packets. Advertisement or Scan Response data packet is a 31 byte payload used to advertise the device's capabilities and connection parameters.
- Accept connections from Bluetooth Smart devices in Central mode that can access its services exposed through the the [Generic Access Profile (GAP)](https://www.bluetooth.org/en-us/specification/assigned-numbers/generic-access-profile). A device has only one instance of the GAP service in the GATT server. The GAP service is a GATT based service with the service UUID as «GAP Service» defined in the [Bluetooth Assigned Numbers document](https://www.bluetooth.com/specifications/assigned-numbers).

The [W3C Web Bluetooth](https://webbluetoothcg.github.io/web-bluetooth) API exposes functionality for Bluetooth Smart clients (Central mode).

### Use cases

This API is used by applications that implement a Bluetooth Peripheral device and expose sensor data via Bluetooth.
- Applications define the Bluetooth Smart services, characteristics and descriptors, then register them with the implementation.
- Applications can build Bluetooth advertisement packets, then start and stop advertising.
- For the defined characteristics, applications should register event listeners for handling requests coming from clients. The event listeners receive the request, and should reply to them with appropriate data, or with an error code.

<a name="apiobject">
The API object
--------------
The API entry point is a [`BluetoothPeripheralDevice`](./#bpd) object that is exposed in a platform-specific manner. As an example, on Node.js it can be obtained by requiring the package that implements this API. On other platforms, it can be constructed.

```javascript
var btdevice = require('bluetooth-peripheral');
```
If the functionality is not supported by the platform, `require` should throw `NotSupportedError`. If the underlying platform doesn't allow using the functionality, `require` should throw `SecurityError`.

<a name="bpd">
### The `BluetoothPeripheralDevice` interface
This object is created and returned by `require`. It has the following read-only properties:

| Property    | Type   | Optional | Default value | Represents |
| ---         | ---    | ---      | ---           | ---        |
| `address`   | String | no | `undefined` | Bluetooth Device Address |
| `addressType` | String enum | no | `undefined` | Bluetooth Device Address Type |
| `name`      | String | yes | `undefined` | the Bluetooth Device Name in scan responses |
| `enabled`   | boolean | no | false | whether Bluetooth is enabled |
| `services`  | array of [service objects](#service) | no | [] | Primary services on the device |
| `version`   | string  | no      | `version` in[`package.json`](../package.json) | API version |

| Event name        | Event callback argument |
| ---               | ---                     |
| `statechange`     | N/A                     |
| `connect`         | String (client Bluetooth Device Address) |
| `disconnect`      | String (client Bluetooth Device Address) |
| `error`           | [`Error`](../README.md/#error)             |

| Method signature                | Description                |
| ---                             | ---                        |
| [`enable()`](#enable)           | enable the device          |
| [`disable()`](#disable)         | disable the device          |
| [`startAdvertising(advertisement, options)`](#startadvertising) | start sending advertisment packets |
| [`stopAdvertising()`](#stopadvertising) | stop sending advertisment packets |
| [`addService(service)`](#addservice) | add a [service object](#service) to the device |
| [`removeService(service)`](#removeservice) | remove a [service object](#service) |

#### `BluetoothPeripheralDevice` properties

<a name="bd_addr">
The `address` property is a 48 bit value (BD_ADDR) identifying a Bluetooth Smart device. On the UI level, the Bluetooth address MUST be represented as 12 hexadecimal characters, possibly divided into sub-parts separated by ‘:’ (e.g., ‘000C3E3A4B69’ or ‘00:0C:3E:3A:4B:69’). On the UI level, any number MUST have the most significant bit on left ordering.

<a name="bd_addr_type">
The `addressType` property can take the following values: `"public"`, `"static-random"`, `"private-resolvable"`, and `"private"`.

<a name="bd_name">
The `name` property represents the Bluetooth device name that a Bluetooth device exposes to remote devices. It is up to 248 bytes encoded as UTF-8, therefore on the UI level it may be restricted to as few as 62 characters if codepoints outside the range U+0000 to U+007F are used. A device cannot expect that a general remote device is able to handle more than the first 40 characters of the Bluetooth device name. If a remote device has limited display capabilities, it may use only the first 20 characters.

<a name="bd_enabled">
The `enabled` property MUST be set to `true` if the Bluetooth Smart functionality is enabled on the device, and otherwise to `false`.

<a name="bd_services">
The `services` property is a read-only array (sequence) of [`BluetoothService`](#service) objects that represents the primary GATT services on the device. A primary service is visible at device root level, and it may contain other services.

<a name="version"></a>
The `version` property is read-only, and provides the master API version, as specified in the `version` property of [`package.json`](../package.json).

#### `BluetoothPeripheralDevice` events

<a name="onstatechange"></a>
The `statechange` event is emitted when the [`enabled`](#bd_enabled) property is changed. Event listeners are called with no parameters and should check the value of the `enabled` property.

<a name="onconnect"></a>
The `connect` event is emitted when a Bluetooth Smart device in Central mode (client) is connected. Event listeners are invoked with the client's [Bluetooth Device Address](#bd_addr) as a string argument.

<a name="ondisconnect"></a>
The `disconnect` event is emitted when a connected client device is disconnected. Event listeners are invoked with the client's [Bluetooth Device Address](#bd_addr) as a string argument.

<a name="onerror"></a>
The `error` event is emitted when a Bluetooth error needs to be reported to the application. Event listeners are invoked with an [`Error`](../README.md/#error) object as argument.

#### `BluetoothPeripheralDevice` methods

<a name="enable"></a>
##### The `enable()` method
Requests enabling the device, and Bluetooth Smart functionality if needed, then returns.
When the device is enabled, implementations should set the `enabled` property to `true` and emit the `statechange` event.

<a name="disable"></a>
##### The `disable()` method
Requests disabling the device, then returns. When the device is disabled, implementations should set the `enabled` property to `false` and emit the `statechange` event.

<a name="startadvertising"></a>
##### The `startAdvertising(advertisement, options)` method
Requests the platform to send Bluetooth Smart advertising packets initialized from the arguments.

<a name="adv-options"></a>
###### The `options` argument
It is an object with the following properties:

| Property  | Type   | Optional | Default value | Represents |
| ---       | ---    | ---      | ---           | ---        |
| `connectable` | boolean | yes | `true` | whether the device can be connected to |
| `minInterval` | Number | yes | selected by the platform | minimum time interval between advertisements|
| `maxInterval` | Number | yes | selected by the platform | maximum time interval between advertisements|

The `connectable` advertisement option is `true` when the device is allowed to be connected by clients.

The `minInterval` advertisement option tells the minimum time interval between consecutive advertisement packets in milliseconds. The value can be between 100 and 32000 milliseconds. Platforms may override this value.

The `maxInterval` advertisement option tells the maximum time interval between consecutive advertisement packets in milliseconds. The value can be between 100 and 32000 milliseconds. Platforms may override this value.

<a name="advertisement"></a>
###### The `advertisement` argument
Advertisement packet data can be of the following types:  string (e.g. flags), device name, transmit power, service UUID (16, 32, or 128 bit), service data, public or random target address, advertising interval, device address, Bluetooth Smart role, URI, or manufacturer data. Applications are expected to build the binary advertisement packets based on the Bluetooth specifications as a `Buffer` object. This API provides helpers for the most common data types. It is an object with properties described in the `startadvertising()` method steps.

The `startadvertising()` method runs the following steps:
- Return a [`Promise`](../README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If `options.connectable` is not `true`, then set `options.connectable` to `false`.
- If `options.minInterval` is `undefined`, set `options.minInterval` to a platform default value. Otherwise, if it is a number, and it is smaller than 100 or bigger than 32000, reject `promise` with `TypeError`. Otherwise, set `options.minInterval` to that value rounded down to the nearest value divisible by 100.
- If `options.maxInterval` is `undefined`, set `options.maxInterval` to a platform default value. Otherwise, if it is a number, and it is smaller than 100 or bigger than 32000, reject `promise` with `TypeError`. Otherwise, set `options.maxInterval` to that value rounded down to the nearest value divisible by 100.
- If `advertisement` is not an object, reject `promise` with `TypeError`.
- If `advertisement.scanResponse` is an object and `advertisement.scanResponse.name` is a string or `advertisement.scanResponse.date` is a [`Buffer`](../README.md/#buffer) object, then let `scanResponse` be `advertisement.scanResponse`.
- If `advertisement.data` is a [`Buffer`](../README.md/#buffer) object, let `buffer` take that value.
- Otherwise, let `buffer` be an empty `Buffer`, and use the properties of `advertisement` (when defined) to prepare `buffer` based on the following properties of `advertisement`. The algorithm on how to prepare `buffer` is described in the Bluetooth specification, and the platform may have an API to support that.
  * `uuids` is an array of Bluetooth UUID strings representing services; if specified, implementations SHOULD add them to the advertisement packet `buffer` compliant to the Bluetooth specification.
  * `serviceData` is an object with two properties, a UUID string `uuid` and a `Buffer` object `data`. Implementations should add `uuid` and `data` to `buffer`, if there is sufficient space in the advertisement packet. If there is not sufficient space, skip to the next step.
  * `manufacturerData` is an object with two properties, a number `manufacturerId` and a `Buffer` data. Implementations should add `manufacturerId` and `data` to `buffer`, if there is sufficient space in the advertisement packet. If there is not sufficient space, skip to the next step.
  * `deviceClass` is a number. If specified, implementations should add it to `buffer`, if there is sufficient space in the advertisement packet. If there is not sufficient space, skip to the next step.
  * `includeTxPower` is a boolean value. If `true`, then implementations should add the transmit power to the advertisement packet, if there is space. If not, skip to the next step.
- Request the underlying platform to start sending the prepared advertisement packet `buffer` with the options specified in `options`. If the request fails, reject `promise` with an [`Error`](../README.md/#error) object `error` that has `error.message` set to `"BluetoothStartAdvertisement"`.
- If the implementation can read the advertisement options used by the platform for this advertisement, set `options.minInterval` and `options.maxInterval` to the actual values used by the platform.
- Resolve `promise` with `options`.

<a name="stopadvertising"></a>
##### The `stopAdvertising()` method
Requests the platform to stop sending advertisement packets. It runs the following steps:
- Request from the underlying platform to stop the current advertisement.
- If the request is unsuccessful, throw an [`Error`](../README.md/#error) object `error` with `error.message` set to `"BluetoothStopAdvertisement"`.

<a name="addservice"></a>
##### The `addService(service)` method
Adds a service to the internal slot representing the primary services. Returns `false` if `service` is not a valid [`BluetoothService`](#service) object, or if `service.primary` is `false`, or if `service.uuid` has already been added.

<a name="removeservice"></a>
##### The `removeService(service, recursive)` method
Removes a service from the internal slot that represents the primary services of the device. Returns `false` if `service` is not a valid [`BluetoothService`](#service) object, or if `service.uuid` is not found in the internal slot of Bluetooth services. If `recursive` is `true`, then also removes all services in `service.includedServices` that are not used by any other service.

<a name="service"></a>
### The `BluetoothService` dictionary
It is an object with the following properties:

| Property    | Type   | Optional | Default value | Represents |
| ---         | ---    | ---      | ---           | ---        |
| `uuid`      | String | no       | `undefined`   | Bluetooth Service UUID |
| `primary`   | boolean | no      | `false`       | whether primary (root) service |
| `characteristics` | array of [`BluetoothCharacteristic`](#characteristic) objects | no | [] | Bluetooth characteristics |
| `includedServices` | array of String | no | [] | list of UUIDs of included services |

<a name="descriptor"></a>
### The `BluetoothDescriptor` dictionary
It is an object with the following properties:

| Property    | Type    | Optional | Default value | Represents |
| ---         | ---     | ---      | ---           | ---        |
| `uuid`      | String  | no       | `undefined`   | Bluetooth Descriptor UUID |
| `value`     | String  | no       | `undefined`   | descriptor value |
| `flags`     | array of String | no | [] | flags (Bluetooth "properties") |

The `flags` property contains a maximum of 2 strings that can be either `"read"` or `"write"`.

<a name="characteristic"></a>
### The `BluetoothCharacteristic` interface
It has the following read-only properties:

| Property    | Type    | Optional | Default value | Represents |
| ---         | ---     | ---      | ---           | ---        |
| `uuid`      | String  | no       | `undefined`   | Bluetooth Descriptor UUID |
| `flags`     | array of String | no | [] | flags (Bluetooth "properties") |
| `descriptors` | array of objects | no | [] | Bluetooth descriptors |
| `notifying` | boolean | no       | `undefined` | whether notifications are on |

| Method signature              | Description                |
| ---                           | ---                        |
| [startNotifications()](#startnotifications) | turn on notifications  |
| [stopNotifications()](#stopnotifications)   | turn off notifications |
| [onread(handler)](#onread)    | registers callback for handling read requests |
| [onwrite(handler)](#onwrite)  | registers callback for handling write requests |
| [onsubscribe(handler)](#onsubscribe) | registers callback for handling subscribe requests |
| [onunsubscribe(handler)](#onunsubscribe) | registers callback for handling unsubscribe requests |
| [onerror(handler)](#oncherror) | registers error handler |

The `BluetoothCharacteristic` object can be constructed with a dictionary that can have any or all of the following properties of `BluetoothCharacteristic`: `uuid`, `flags`, `descriptors`.

#### `BluetoothCharacteristic` properties

The `uuid` property is a string that represents a Bluetooth UUID.

The `flags` property is an array of strings that can take the following values: `"read"`, `"write"`, `"notify"`.

The `descriptors` property is an array of [`BluetoothDescriptor`](#descriptor) objects that describe this Bluetooth Characteristic.

The `notifying` property is a boolean that is `true` when notifications are turned on and `false` otherwise.

#### `BluetoothCharacteristic` methods

<a name="startnotifications"></a>
##### The `startNotifications()` method
Requests the underlying platform to start sending notifications for this characteristic to all subscribed clients.

<a name="stopnotifications"></a>
##### The `stopNotifications()` method
Requests the underlying platform to stop sending notifications for this characteristic.

<a name="onread"></a>
##### The `onread(handler)` method
Registers a function to handle read requests for the Characteristic. The `handler` argument is a function that accepts a [`BluetoothCharacteristicRequest`](#request) argument.

<a name="onwrite"></a>
##### The `onwrite(handler)` method
Registers a function to handle write requests for the Characteristic. The `handler` argument is a function that accepts a [`BluetoothCharacteristicRequest`](#request) argument.

<a name="onsubscribe"></a>
##### The `onsubscribe(handler)` method
Registers a function to handle subscribe requests for the Characteristic. The `handler` argument is a function that accepts a [`BluetoothCharacteristicRequest`](#request) argument.

<a name="onunsubscribe"></a>
##### The `onunsubscribe(handler)` method
Registers a function to handle unsubscribe requests for the Characteristic. The `handler` argument is a function that accepts a [`BluetoothCharacteristicRequest`](#request) argument.

<a name="oncherror"></a>
##### The `onerror(handler)` method
Registers a function to handle Bluetooth errors concerning operations with Characteristics that need to be reported to the application. The `handler` argument is a function that accepts an [`Error`](../README.md/#error) object as argument.

<a name="characteristicrequest"></a>
### The `BluetoothCharacteristicRequest` interface

Contains the following read-only properties:

| Property    | Type    | Optional | Default value | Represents |
| ---         | ---     | ---      | ---           | ---        |
| `type`      | String  | no       | `undefined`   | request type |
| `source`    | String  | no       | `undefined`   | client Bluetooth Device Address |
| `data`      | `Buffer` | yes     | `null`        | data |
| `offset`    | number  | yes      | 0             | Offset in data |
| `needsResponse` | boolean | yes  | `true`        | whether response needs to be sent |

| Method signature              | Description                |
| ---                           | ---                        |
| [respond(data)](#respond)     | send a response with data  |
| [respondWithError(error)](#errormethod) | send an error response |

#### `BluetoothCharacteristicRequest` properties

The `type` property is a string that can take one of the following values: `"read"`, `"write"`, `"notify"`, `"subscribe"`, `"unsubscribe"`.

The `source` property is a string representing the Bluetooth Device Address of the client.

The `data` property is a [`Buffer`](../README.md/#buffer) object that is not `null` for `"write"` operation, and `null` otherwise.

The `offset` property is a positive number that specifies the byte offset in `data` pertaining to the operation (read or write).

The `needsResponse` property is a boolean that is by default `true`.

#### `BluetoothCharacteristicRequest` methods

<a name="respond"></a>
##### The `respond(data)` method
Sends a response to the request. It executes the following steps:
- Create a response to the request, and include `data` in the response.
- Request from the underlying platform to send the response to the client.
- If the request is unsuccessful, throw an [`Error`](../README.md/#error) object `error` with `error.message` set to `"BluetoothSendResponse"`.

<a name="errormethod"></a>
##### The `error(error)` method
Sends an error response to the request. It executes the following steps:
- Create an error response to the request, and include `error` in the response.
- Request from the underlying platform to send the response to the client.
- If the request is unsuccessful, throw an [`Error`](../README.md/#error) object `error` with `error.message` set to `"BluetoothSendErrorResponse"`.
