import { InputPassword } from "./password";
import { InputText } from "./text";


const Input =  Object.assign(InputText, {
    Password: InputPassword,
});

export default Input;