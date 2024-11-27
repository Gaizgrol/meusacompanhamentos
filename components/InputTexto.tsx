import { TextInput, TextInputProps, View } from "react-native";
import { Bar } from "react-native-progress";

export type InputTextoProps = TextInputProps & {
    disabled?: boolean
    loading?: boolean
}

export default function InputTexto({ disabled, loading, value, onChangeText, style = null, ...props }: InputTextoProps) {
    return <View>
        <TextInput
            editable={!disabled && !loading}
            value={value}
            onChangeText={onChangeText}
            style={typeof style === 'object'
                ? {
                    fontSize: 20,
                    color: loading ? '#AFAFAF' : '#000000',
                    borderBottomColor: '#007FFF',
                    borderBottomWidth: loading ? 0 : 1,
                    ...style
                }
                : style
            }
            {...props}
        />
        {loading && <Bar indeterminate borderWidth={0} width={null} height={2}/>}
    </View>
}