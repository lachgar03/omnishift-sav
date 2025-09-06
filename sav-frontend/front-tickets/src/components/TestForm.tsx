import { Button, Stack, Title } from '@mantine/core'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { FormInput } from '@components/ui/FormInput'

type FormValues = {
  email: string
  password: string
}

const schema: yup.ObjectSchema<FormValues> = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
})

export default function TestForm() {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = (values: FormValues) => {
    console.log('TestForm submit:', values)
  }

  return (
    <Stack maw={420} mx="auto" mt="xl">
      <Title order={3}>Test Form</Title>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          <FormInput
            control={control}
            name="email"
            label="Email"
            placeholder="you@example.com"
            type="email"
          />
          <FormInput
            control={control}
            name="password"
            label="Password"
            placeholder="Your password"
            type="password"
          />
          <Button type="submit" loading={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
            Submit
          </Button>
        </Stack>
      </form>
    </Stack>
  )
}
