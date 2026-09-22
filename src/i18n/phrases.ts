import { comboboxPhrases } from '@/components/combobox/combobox.phrases';
import { datePickerPhrases } from '@/components/date-picker/date-picker.phrases';
import { dialogPhrases } from '@/components/dialog/dialog.phrases';
import { searchFieldPhrases } from '@/components/search-field/search-field.phrases';
import { stepperPhrases } from '@/components/stepper/stepper.phrases';
import { timePickerPhrases } from '@/components/time-picker/time-picker.phrases';
import { toastPhrases } from '@/components/toast/toast.phrases';
import { treeListPhrases } from '@/components/tree-list/tree-list.phrases';
import { mergePhrases } from '@/utils/phrase';

/**
 * Every label the library renders, keyed `enonic.ui.<component>.<name>`: the list of what an application
 * can translate, and what it asserts its own phrase bundle against. The components resolve through
 * their own fragments, not through this.
 */
export const uiPhrases = mergePhrases([
  comboboxPhrases,
  datePickerPhrases,
  dialogPhrases,
  searchFieldPhrases,
  stepperPhrases,
  timePickerPhrases,
  toastPhrases,
  treeListPhrases,
]);

export type UiPhraseKey = keyof typeof uiPhrases;
