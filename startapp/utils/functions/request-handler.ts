import { isAxiosError } from "axios";
import { apiResponse } from "../../types/api-response";
import Toast from 'react-native-toast-message';


export async function requestHandler<T>(
  request: Promise<{ data: apiResponse<T> }>,
): Promise<apiResponse<T>> {
  try {
    const response = await request;

    return response.data;
  } catch (error: unknown) {
    let message = "Falha de comunicação com o servidor.";

    if (isAxiosError(error)) {
      message = error.response?.data.message ?? message;
    }

    return { success: false, message } as apiResponse<T>;
  }
}


export function handleApiError(error: any, defaultMessage = 'Erro ao conectar. Tente novamente.') {
  if (error?.response?.status === 401) {
    Toast.show({
      type: 'error',
      text1: 'Login inválido',
      text2: 'E-mail ou senha incorretos.',
    });
  } else if (error?.response?.data?.message) {
    Toast.show({
      type: 'error',
      text1: 'Erro',
      text2: error.response.data.message,
    });
  } else {
    Toast.show({
      type: 'error',
      text1: 'Erro',
      text2: defaultMessage,
    });
  }
}