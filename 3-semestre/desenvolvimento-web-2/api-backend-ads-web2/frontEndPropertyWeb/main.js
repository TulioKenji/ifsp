async function loadProperties(){
    const result = await fetch('http://localhost:3000/property/list');
    const data = await result.json();
    console.log(data);
}