import { render } from '@testing-library/react';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { useSubject } from '../subscribe';

const Listener = ({
  subject,
  onValue,
}: {
  subject: Subject<number> | null;
  onValue: (value: number) => void;
}) => {
  useSubject(subject as Subject<number>, onValue, [subject, onValue]);
  return null;
};

describe('useSubject', () => {
  it('subscribes to subject and forwards values', () => {
    const subject = new Subject<number>();
    const onValue = vi.fn();

    render(<Listener subject={subject} onValue={onValue} />);
    subject.next(7);

    expect(onValue).toHaveBeenCalledWith(7);
  });

  it('unsubscribes on unmount', () => {
    const subject = new Subject<number>();
    const onValue = vi.fn();
    const unsubscribe = vi.fn();
    vi.spyOn(subject, 'subscribe').mockReturnValue({ unsubscribe } as any);

    const { unmount } = render(
      <Listener subject={subject} onValue={onValue} />,
    );
    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });

  it('no-ops when subject is falsy', () => {
    const onValue = vi.fn();
    expect(() =>
      render(<Listener subject={null} onValue={onValue} />),
    ).not.toThrow();
  });
});
