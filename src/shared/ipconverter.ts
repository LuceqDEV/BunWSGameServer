export class IpConverter {
    public static getIPv4(ip: string): string {
        const ipv6MappedPrefix = "::ffff:";

        if (ip.startsWith(ipv6MappedPrefix)) {
            return ip.slice(ipv6MappedPrefix.length);
        }

        return ip;
    }
}