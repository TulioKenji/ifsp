package server

import (
	"net"
	"sync"
)

// BoundListener limita sockets antes de criar goroutines HTTP/TLS. Inclui conexões
// ociosas e headers incompletos (que ainda não chegaram aos middlewares).
func BoundListener(inner net.Listener, max, perIP int) net.Listener {
	return &boundedListener{Listener: inner, max: max, perIP: perIP, ips: map[string]int{}}
}

type boundedListener struct {
	net.Listener
	mu                sync.Mutex
	max, perIP, total int
	ips               map[string]int
}

func (l *boundedListener) Accept() (net.Conn, error) {
	for {
		conn, err := l.Listener.Accept()
		if err != nil {
			return nil, err
		}
		ip, _, err := net.SplitHostPort(conn.RemoteAddr().String())
		if err != nil {
			ip = conn.RemoteAddr().String()
		}
		l.mu.Lock()
		if l.total >= l.max || l.ips[ip] >= l.perIP {
			l.mu.Unlock()
			_ = conn.Close()
			continue
		}
		l.total++
		l.ips[ip]++
		l.mu.Unlock()
		return &countedConn{Conn: conn, release: func() {
			l.mu.Lock()
			defer l.mu.Unlock()
			l.total--
			l.ips[ip]--
			if l.ips[ip] == 0 {
				delete(l.ips, ip)
			}
		}}, nil
	}
}

type countedConn struct {
	net.Conn
	once    sync.Once
	release func()
}

func (c *countedConn) Close() error { err := c.Conn.Close(); c.once.Do(c.release); return err }
