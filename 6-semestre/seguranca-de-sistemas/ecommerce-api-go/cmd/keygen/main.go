// keygen cria o segredo fora do banco. Nunca imprime a chave ou sobrescreve uma existente.
package main

import (
	"crypto/rand"
	"encoding/base64"
	"flag"
	"log"
	"os"
	"path/filepath"
)

func main() {
	path := flag.String("out", ".secrets/data.key", "arquivo de destino (não sobrescreve)")
	flag.Parse()
	key := make([]byte, 32)
	if _, err := rand.Read(key); err != nil {
		log.Fatal("falha ao gerar chave")
	}
	if err := os.MkdirAll(filepath.Dir(*path), 0700); err != nil {
		log.Fatal("não foi possível criar diretório da chave")
	}
	f, err := os.OpenFile(*path, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0600)
	if err != nil {
		log.Fatal("arquivo já existe ou não pode ser criado; a chave atual foi preservada")
	}
	if _, err = f.WriteString(base64.StdEncoding.EncodeToString(key) + "\n"); err != nil {
		f.Close()
		log.Fatal("falha ao salvar chave")
	}
	if err = f.Sync(); err != nil {
		f.Close()
		log.Fatal("falha ao sincronizar chave no disco")
	}
	if err = f.Close(); err != nil {
		log.Fatal("falha ao fechar arquivo da chave")
	}
	log.Print("chave criada. Guarde backup protegido, configure DATA_KEY_FILE e não versione o arquivo")
}
