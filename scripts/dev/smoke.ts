import { style } from '@/utils/shellStyle';

const show = (value: string): string => JSON.stringify(value);

for (const name of ['reset', 'bold', 'italic', 'underline', 'hidden', 'strikethrough'] as const) {
  console.log(name.padEnd(14), show(style[name]('text')), ' →', style[name]('text'));
}

console.log('nested:', style.bold('bold ' + style.italic('and italic') + ' still bold'));
console.log('over a preset:', style.info('info ' + style.underline('underlined') + ' still info'));
console.log('style count:', Object.keys(style).length);
