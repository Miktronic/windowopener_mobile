import React from 'react';
import {Column, Input, Select, Text} from 'native-base';

export const TitledPlainInput = ({title, textProps, inputProps, ...props}) => {
  return (
    <Column {...props}>
      <Text
        fontWeight={'700'}
        fontStyle={'normal'}
        color={'#8B8B8B'}
        fontSize={14}
        {...textProps}>
        {title}
      </Text>
      <Input
        backgroundColor={'#F5F6F9'}
        borderRadius={0}
        h={50}
        fontSize={14}
        mt={1}
        {...inputProps}
      />
    </Column>
  );
};

export const TitledPlainSelect = ({
  title,
  textProps,
  inputProps,
  children,
  ...props
}) => {
  return (
    <Column {...props}>
      <Text
        fontWeight={'700'}
        fontStyle={'normal'}
        color={'#8B8B8B'}
        fontSize={14}
        {...textProps}>
        {title}
      </Text>
      <Select
        backgroundColor={'#F5F6F9'}
        borderRadius={0}
        h={50}
        fontSize={14}
        mt={1}
        {...inputProps}>
        {children}
      </Select>
    </Column>
  );
};
