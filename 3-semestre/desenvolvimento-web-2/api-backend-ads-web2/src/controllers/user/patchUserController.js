const patchUserController = (req, res) => {
    res.json({
      message: "nome atualizado",
      user: "tulio",
      email:"tulio.ky",
      avatar: "https://github.com/tuliokenji.png"
    })
  }

export default patchUserController