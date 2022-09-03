import {
  ExpirationCompleteEvent,
  Publisher,
  Subjects,
} from '@stark-innovations/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
