import type { Processor } from '@mastra/core/processors';
import type { ChunkType } from '@mastra/core/streaming';
import type { MastraMessageV2 } from '@mastra/core';

/**
 * FinalResponseProcessor
 *
 * This processor filters out all text-delta chunks during streaming
 * and emits a single custom event with the complete final response
 * when the stream finishes.
 *
 * Usage:
 * ```typescript
 * new FinalResponseProcessor({
 *   emitTextDeltas: false // Set to true if you want both deltas and final response
 * })
 * ```
 */
export class FinalResponseProcessor implements Processor {
  name = 'final-response-processor';
  private fullText = '';
  private options: {
    emitTextDeltas: boolean;
  };

  constructor(options?: { emitTextDeltas?: boolean }) {
    this.options = {
      emitTextDeltas: options?.emitTextDeltas ?? false,
    };
  }

  async processOutputStream({
    part,
    state,
  }: {
    part: ChunkType;
    streamParts: ChunkType[];
    state: Record<string, any>;
    abort: (reason?: string) => never;
  }): Promise<ChunkType | null> {
    // Accumulate text-delta chunks
    if (part.type === 'text-delta') {
      const text = (part.payload as any)?.text || '';
      this.fullText += text;

      // Return null to suppress text-delta events if configured
      if (!this.options.emitTextDeltas) {
        return null;
      }
      return part;
    }

    // When we receive the finish event, emit our custom final response
    if (part.type === 'finish') {
      // Create a custom chunk with the full response
      const finalResponseChunk: ChunkType = {
        type: 'text-end' as any,
        runId: part.runId,
        from: part.from,
        payload: {
          finalResponse: this.fullText,
          isComplete: true,
          ...part.payload,
        } as any,
      };

      // Reset for next execution
      this.fullText = '';

      // Return the custom chunk
      return finalResponseChunk;
    }

    // Pass through all other chunks unchanged
    return part;
  }

  async processOutputResult({
    messages,
  }: {
    messages: MastraMessageV2[];
    abort: (reason?: string) => never;
  }): Promise<MastraMessageV2[]> {
    // For non-streaming responses, just return messages as-is
    return messages;
  }

  // Reset method for testing or manual resets
  reset(): void {
    this.fullText = '';
  }
}
