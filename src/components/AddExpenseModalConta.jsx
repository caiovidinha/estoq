import { React,useState } from 'react'
import { Modal, Button, Text, Input, Row, Checkbox } from "@nextui-org/react";
import { GiTakeMyMoney } from 'react-icons/gi'


const AddExpenseModalConta = () => {
    const [visible, setVisible] = useState(false)
    const handler = () => setVisible(true)
  
    const closeHandler = () => {
      setVisible(false)
      console.log("closed")
    }
  return (
    <div>
      <Button className='bg-red-200 mt-2' rounded shadow auto color='' onPress={handler} icon={<GiTakeMyMoney className='text-red-800' size={20}/>}>

      </Button>
      <Modal
        closeButton
        aria-labelledby="modal-title"
        open={visible}
        onClose={closeHandler}
      >
        <Modal.Header>
          <Text id="modal-title" size={18}>
            Welcome to
            <Text b size={18}>
              NextUI
            </Text>
          </Text>
        </Modal.Header>
        <Modal.Body>
          <Input
            clearable
            bordered
            fullWidth
            color="primary"
            size="lg"
            placeholder="Email"
          />
          <Input
            clearable
            bordered
            fullWidth
            color="primary"
            size="lg"
            placeholder="Password"
          />
          <Row justify="space-between">
            <Checkbox>
              <Text size={14}>Remember me</Text>
            </Checkbox>
            <Text size={14}>Forgot password?</Text>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button auto flat color="error" onPress={closeHandler}>
            Close
          </Button>
          <Button auto onPress={closeHandler}>
            Sign in
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default AddExpenseModalConta