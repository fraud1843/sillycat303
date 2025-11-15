const net = require('net');
const readline = require('readline');
const mysql = require('mysql2/promise');

class EducationalC2Simulator {
    constructor() {
        this.config = {
            port: 999,
            banner: `
╔══════════════════════════════════════╗
║        EDUCATIONAL C2 SIMULATOR      ║
║     FOR SECURITY RESEARCH ONLY       ║
╚══════════════════════════════════════╝
This is a simulation for educational purposes.
No actual attacks are performed.
`
        };
        this.users = new Map();
        this.sessions = new Map();
    }

    async start() {
        console.log('Starting Educational C2 Simulator...');
        
        // Simulate database connection
        await this.initDatabase();
        
        // Start TCP server (like real C2)
        this.server = net.createServer((socket) => {
            this.handleConnection(socket);
        });

        this.server.listen(this.config.port, () => {
            console.log(`Simulator listening on port ${this.config.port}`);
            console.log('Connect using: telnet localhost 999');
        });
    }

    async initDatabase() {
        // Simulated database - no real MySQL required
        console.log('Initializing simulated database...');
        this.mockUsers = [
            { id: 1, username: 'admin', password: 'admin', role: 'admin' },
            { id: 2, username: 'user1', password: 'pass1', role: 'user' }
        ];
    }

    handleConnection(socket) {
        const sessionId = Math.random().toString(36).substr(2, 9);
        this.sessions.set(sessionId, {
            socket: socket,
            authenticated: false,
            user: null,
            remoteAddress: socket.remoteAddress
        });

        socket.write(this.config.banner + '\r\n\r\n');
        socket.write('login: ');
        
        let username = '';
        let password = '';
        let stage = 'username';

        socket.on('data', (data) => {
            const input = data.toString().trim();
            
            if (!this.sessions.get(sessionId).authenticated) {
                if (stage === 'username') {
                    username = input;
                    socket.write('password: ');
                    stage = 'password';
                } else if (stage === 'password') {
                    password = input;
                    this.authenticate(sessionId, username, password, socket);
                }
            } else {
                this.handleCommand(sessionId, input, socket);
            }
        });

        socket.on('end', () => {
            this.sessions.delete(sessionId);
            console.log(`Session ${sessionId} disconnected`);
        });
    }

    authenticate(sessionId, username, password, socket) {
        const user = this.mockUsers.find(u => u.username === username && u.password === password);
        
        if (user) {
            const session = this.sessions.get(sessionId);
            session.authenticated = true;
            session.user = user;
            
            socket.write(`\r\nWelcome ${username}!\r\n`);
            socket.write('Type "help" for available commands\r\n');
            this.showPrompt(socket);
        } else {
            socket.write('\r\nAuthentication failed\r\n');
            socket.write('login: ');
            // Reset auth stage
            const session = this.sessions.get(sessionId);
            session.authenticated = false;
            session.user = null;
        }
    }

    handleCommand(sessionId, input, socket) {
        const session = this.sessions.get(sessionId);
        const [command, ...args] = input.split(' ');

        console.log(`[EDUCATIONAL] User ${session.user.username} executed: ${command}`);

        switch(command.toLowerCase()) {
            case 'help':
                this.showHelp(socket);
                break;
            case 'methods':
                this.showMethods(socket);
                break;
            case 'myinfo':
                this.showUserInfo(session, socket);
                break;
            case 'attack':
                this.simulateAttack(args, session, socket);
                break;
            case 'stats':
                this.showStats(socket);
                break;
            case 'clear':
                socket.write('\x1B[2J\x1B[0;0f'); // Clear screen
                break;
            case 'exit':
            case 'quit':
                socket.write('Goodbye!\r\n');
                socket.end();
                break;
            default:
                socket.write(`Unknown command: ${command}\r\n`);
        }

        if (command.toLowerCase() !== 'exit' && command.toLowerCase() !== 'quit') {
            this.showPrompt(socket);
        }
    }

    showPrompt(socket) {
        socket.write('\r\n[EDU-C2]> ');
    }

    showHelp(socket) {
        const helpText = `
Available Commands:
  help     - Show this help message
  methods  - Show available (simulated) methods
  myinfo   - Show your user information
  attack   - Simulate an attack (no real traffic)
  stats    - Show simulation statistics
  clear    - Clear the screen
  exit     - Disconnect

This is an educational simulation only.
No actual network attacks are performed.
`;
        socket.write(helpText);
    }

    showMethods(socket) {
        const methods = `
Simulated Attack Methods:
  udp      - Simulated UDP flood
  tcp      - Simulated TCP flood  
  http     - Simulated HTTP flood
  ldap     - Simulated LDAP amplification

NOTE: These methods only simulate attacks for educational purposes.
No actual packets are sent to any target.
`;
        socket.write(methods);
    }

    showUserInfo(session, socket) {
        const user = session.user;
        const info = `
User Information:
  Username: ${user.username}
  Role: ${user.role}
  Session: ${session.remoteAddress}
  Authenticated: ${session.authenticated}

This is simulated user data for educational purposes.
`;
        socket.write(info);
    }

    simulateAttack(args, session, socket) {
        if (args.length < 3) {
            socket.write('Usage: attack <method> <target> <port> <duration>\r\n');
            socket.write('Example: attack udp 1.2.3.4 80 60\r\n');
            return;
        }

        const [method, target, port, duration = '30'] = args;
        
        socket.write(`\r\n[SIMULATION] Starting ${method} attack on ${target}:${port} for ${duration} seconds\r\n`);
        socket.write('[SIMULATION] This is educational - no real attack is occurring\r\n');
        socket.write('[SIMULATION] Attack would normally send packets here...\r\n');
        
        // Simulate attack progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            socket.write(`[SIMULATION] Progress: ${progress}% - Sending fake ${method} packets...\r\n`);
            
            if (progress >= 100) {
                clearInterval(interval);
                socket.write('[SIMULATION] Attack completed (simulated)\r\n');
                socket.write('[SIMULATION] 0 real packets were sent\r\n');
            }
        }, 500);
    }

    showStats(socket) {
        const stats = `
Simulation Statistics:
  Active Sessions: ${this.sessions.size}
  Total Users: ${this.mockUsers.length}
  Simulated Attacks: ${Math.floor(Math.random() * 100)}
  Uptime: ${process.uptime().toFixed(0)} seconds

All data is simulated for educational purposes.
`;
        socket.write(stats);
    }
}

// Start the simulator
const simulator = new EducationalC2Simulator();
simulator.start().catch(console.error);
